import { join } from 'path';
import { StorageHelper } from '../helpers/StorageHelper';
import { existsSync } from 'fs';
import { Service } from 'typedi';
import { HttpHelper, ZipHelper } from '@aurora-launcher/core';
import tar from 'tar';
import { mkdir, readdir } from 'fs/promises';
import { Architecture, Platform } from '../core/System';

@Service()
export class JavaManager {
    async checkAndDownloadJava(majorVersion: number) {
        const javaDir = await this.#getJavaDir(majorVersion);
        if (existsSync(javaDir)) return true;

        const javaLink =
            'https://api.adoptium.net/v3/binary/latest/{version}/ga/{os}/{arch}/jre/hotspot/normal/eclipse';

        const javaFile = await HttpHelper.downloadFile(
            javaLink
                .replace('{version}', majorVersion.toString())
                .replace('{os}', this.#getOs())
                .replace('{arch}', this.#getArch()),
            null,
            { saveToTempFile: true },
        );

        if (process.platform === Platform.WINDOWS) {
            ZipHelper.unzip(javaFile, javaDir);
        } else {
            await mkdir(javaDir, { recursive: true });
            await tar.x({ file: javaFile, cwd: javaDir });
        }
    }

    async getJavaPath(majorVersion: number) {
        const path = ['bin', 'java'];
        if (process.platform === Platform.MACOS) {
            path.unshift('Contents', 'Home');
        }
        return join(await this.#getJavaDir(majorVersion), ...path);
    }

    async #getJavaDir(majorVersion: number) {
        const javaVerPath = join(
            StorageHelper.javaDir,
            majorVersion.toString(),
        );
        const firstDir = (await readdir(javaVerPath))[0];

        return join(javaVerPath, firstDir);
    }

    #getOs() {
        const PlatformToJavaOS = {
            [Platform.WINDOWS]: JavaOs.WINDOWS,
            [Platform.MACOS]: JavaOs.MAC,
            [Platform.LINUX]: JavaOs.LINUX,
        };
        return PlatformToJavaOS[<Platform>process.platform] || process.platform;
    }

    #getArch() {
        const ArchitectureToJavaOS = {
            [Architecture.X32]: JavaArchitecture.X32,
            [Architecture.X64]: JavaArchitecture.X64,
            [Architecture.ARM]: JavaArchitecture.ARM,
            [Architecture.ARM64]: JavaArchitecture.ARM64,
        };
        return ArchitectureToJavaOS[<Architecture>process.arch] || process.arch;
    }
}

enum JavaOs {
    WINDOWS = 'windows',
    MAC = 'mac',
    LINUX = 'linux',
}

enum JavaArchitecture {
    ARM = 'arm',
    ARM64 = 'aarch64',
    X32 = 'x86',
    X64 = 'x64',
}
