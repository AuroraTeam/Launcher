import { execFile } from 'child_process';
import { chmod, mkdir, mkdtemp, readdir, rename, rm, stat } from 'fs/promises';
import { join } from 'path';

import { HashHelper, HttpHelper, ZipHelper } from '@aurora-launcher/core';
import { Service } from '@freshgum/typedi';

import { Architecture, Platform } from '../core/System';
import { PlatformHelper } from '../helpers/PlatformHelper';
import { StorageHelper } from '../helpers/StorageHelper';
import { GameWindow } from './GameWindow';

@Service([])
export class JavaManager {
    private readonly installations = new Map<number, Promise<void>>();

    checkAndDownloadJava(
        majorVersion: number,
        gameWindow: GameWindow,
    ): Promise<void> {
        const existing = this.installations.get(majorVersion);
        if (existing) return existing;
        const installation = this.ensureJava(majorVersion, gameWindow).finally(
            () => {
                this.installations.delete(majorVersion);
            },
        );
        this.installations.set(majorVersion, installation);
        return installation;
    }

    private async ensureJava(
        majorVersion: number,
        gameWindow: GameWindow,
    ): Promise<void> {
        const javaDir = this.#getJavaDir(majorVersion);
        try {
            await this.validateRuntime(javaDir, majorVersion);
            return;
        } catch {
            // Replace incomplete installations only after a new runtime has been validated.
        }

        gameWindow.sendToConsole('Download Java');
        const javaUrl = new URL(
            'https://api.azul.com/metadata/v1/zulu/packages/',
        );
        javaUrl.search = new URLSearchParams({
            java_version: majorVersion.toString(),
            os: this.#getOs(),
            arch: this.#getArch(),
            archive_type: 'zip',
            java_package_type: 'jre',
            javafx_bundled: 'false',
            latest: 'true',
            release_status: 'ga',
            page: '1',
            page_size: '1',
        }).toString();
        const [selectedPackage] =
            await HttpHelper.getResourceFromJson<JavaData[]>(javaUrl);
        if (!selectedPackage?.download_url || !selectedPackage.package_uuid) {
            throw new Error(
                `No Java ${majorVersion} runtime found for this platform`,
            );
        }
        const details = await HttpHelper.getResourceFromJson<JavaDetails>(
            `https://api.azul.com/metadata/v1/zulu/packages/${selectedPackage.package_uuid}`,
        );
        if (!/^[a-f\d]{32}$/i.test(details.md5_hash))
            throw new Error('Missing Java archive checksum');

        await mkdir(StorageHelper.javaDir, { recursive: true });
        const stagingDir = await mkdtemp(
            join(StorageHelper.javaDir, `${majorVersion}.installing-`),
        );
        const archive = join(stagingDir, 'runtime.zip');
        const runtimeDir = join(stagingDir, 'runtime');
        try {
            await HttpHelper.downloadFile(
                selectedPackage.download_url,
                archive,
                {
                    onProgress: (progress) =>
                        gameWindow.sendProgress({
                            total: progress.total,
                            loaded: progress.transferred,
                            type: 'size',
                        }),
                },
            );
            gameWindow.sendToConsole('Validate Java');
            if (
                !(await HashHelper.compareFileHash(
                    archive,
                    'md5',
                    details.md5_hash.toLowerCase(),
                ))
            ) {
                throw new Error('Java archive checksum mismatch');
            }

            gameWindow.sendToConsole('Unpacking Java');
            await mkdir(runtimeDir);
            const extractedFiles = await ZipHelper.unzip(archive, runtimeDir);
            if (extractedFiles.length === 0)
                throw new Error('Java archive is empty');
            for (const file of extractedFiles) {
                if (
                    !(await HashHelper.compareFileHash(
                        join(runtimeDir, file.path),
                        'sha1',
                        file.sha1,
                    ))
                ) {
                    throw new Error(
                        `Java extracted file checksum mismatch: ${file.path}`,
                    );
                }
            }

            const javaPath = await this.findJavaExecutable(runtimeDir);
            if (PlatformHelper.isLinux || PlatformHelper.isMac)
                await chmod(javaPath, 0o744);
            await this.validateRuntime(runtimeDir, majorVersion);
            await rm(javaDir, { recursive: true, force: true });
            await rename(runtimeDir, javaDir);
        } finally {
            await rm(stagingDir, { recursive: true, force: true });
        }
    }

    async getJavaPath(majorVersion: number): Promise<string> {
        return this.findJavaExecutable(this.#getJavaDir(majorVersion));
    }

    private async findJavaExecutable(
        directory: string,
        depth = 0,
    ): Promise<string> {
        const executable = PlatformHelper.isWindows ? 'java.exe' : 'java';
        for (const candidate of [
            join(directory, 'bin', executable),
            join(directory, 'Contents', 'Home', 'bin', executable),
        ]) {
            if ((await stat(candidate).catch(() => undefined))?.isFile())
                return candidate;
        }
        if (depth < 2) {
            const entries = await readdir(directory, { withFileTypes: true });
            for (const entry of entries) {
                if (!entry.isDirectory()) continue;
                try {
                    return await this.findJavaExecutable(
                        join(directory, entry.name),
                        depth + 1,
                    );
                } catch {
                    // Try the remaining package/bundle directories.
                }
            }
        }
        throw new Error(`Java executable not found in ${directory}`);
    }

    private async validateRuntime(
        directory: string,
        majorVersion: number,
    ): Promise<void> {
        const javaPath = await this.findJavaExecutable(directory);
        await new Promise<void>((resolve, reject) => {
            execFile(
                javaPath,
                ['-version'],
                { timeout: 15000, windowsHide: true, encoding: 'utf8' },
                (error, stdout, stderr) => {
                    if (error)
                        return reject(
                            new Error('Java runtime cannot be started', {
                                cause: error,
                            }),
                        );
                    const version = `${stdout}\n${stderr}`.match(
                        /\b(?:openjdk|java)(?: version)?\s+"?(\d+)(?:\.(\d+))?/i,
                    );
                    const detectedMajor =
                        version?.[1] === '1'
                            ? Number(version[2])
                            : Number(version?.[1]);
                    if (detectedMajor !== majorVersion) {
                        return reject(
                            new Error(
                                `Expected Java ${majorVersion}, got ${version?.[0] ?? 'unknown version'}`,
                            ),
                        );
                    }
                    resolve();
                },
            );
        });
    }

    #getJavaDir(majorVersion: number) {
        if (!Number.isInteger(majorVersion) || majorVersion <= 0)
            throw new Error('Invalid Java major version');
        return join(StorageHelper.javaDir, majorVersion.toString());
    }

    #getOs() {
        const os = {
            [Platform.WINDOWS]: JavaOs.WINDOWS,
            [Platform.MACOS]: JavaOs.MAC,
            [Platform.LINUX]: JavaOs.LINUX,
        };
        return os[process.platform as Platform] || process.platform;
    }

    #getArch() {
        const arch = {
            [Architecture.X32]: JavaArchitecture.X32,
            [Architecture.X64]: JavaArchitecture.X64,
            [Architecture.ARM]: JavaArchitecture.ARM,
            [Architecture.ARM64]: JavaArchitecture.ARM64,
        };
        return arch[process.arch as Architecture] || process.arch;
    }
}

enum JavaOs {
    WINDOWS = 'windows',
    MAC = 'macos',
    LINUX = 'linux',
}

enum JavaArchitecture {
    ARM = 'aarch32',
    ARM64 = 'aarch64',
    X32 = 'i686',
    X64 = 'x64',
}

interface JavaData {
    package_uuid: string;
    download_url: string;
}

interface JavaDetails {
    md5_hash: string;
}
