import { existsSync } from 'fs';
import { readdir, chmod } from 'fs/promises';
import { join } from 'path';

import { HttpHelper, ZipHelper } from '@aurora-launcher/core';
import { Service } from '@freshgum/typedi';

import { Architecture, Platform } from '../core/System';
import { PlatformHelper } from '../helpers/PlatformHelper';
import { StorageHelper } from '../helpers/StorageHelper';
import { GameWindow } from './GameWindow';

@Service([GameWindow])
export class JavaManager {
    // TODO Лишнее связывание, придумать как сделать лучше
    constructor(private gameWindow: GameWindow) {}

    async checkAndDownloadJava(majorVersion: number) {
        const javaDir = this.#getJavaDir(majorVersion);
        if (existsSync(javaDir)) return true;

        const javaLink =
            'https://api.azul.com/metadata/v1/zulu/packages/?java_version={version}&os={os}&arch={arch}&archive_type=zip&java_package_type=jre&javafx_bundled=false&latest=true&release_status=ga&availability_types=CA&certifications=tck&page=1&page_size=1';

        this.gameWindow.sendToConsole('Download Java');
        const javaData: JavaData[] = await HttpHelper.getResourceFromJson(
            javaLink
                .replace('{version}', majorVersion.toString())
                .replace('{os}', this.#getOs())
                .replace('{arch}', this.#getArch()),
        );
        const javaFile = await HttpHelper.downloadFile(
            javaData[0].download_url,
            null,
            {
                saveToTempFile: true,
                onProgress: (progress) => {
                    this.gameWindow.sendProgress({
                        total: progress.total,
                        loaded: progress.transferred,
                        type: 'size',
                    });
                },
            },
        );
        this.gameWindow.sendToConsole('Unpacking Java');
        ZipHelper.unzip(javaFile, javaDir);
        if (PlatformHelper.isLinux || PlatformHelper.isMac) {
            await chmod(await this.getJavaPath(majorVersion), 744);
        }
    }

    async getJavaPath(majorVersion: number) {
        const path = ['bin', 'java'];
        if (PlatformHelper.isMac) {
            path.unshift(`zulu-${majorVersion}.jre`, 'Contents', 'Home');
        }

        const javaVerPath = this.#getJavaDir(majorVersion);
        const firstDir = (await readdir(javaVerPath))[0];

        return join(javaVerPath, firstDir, ...path);
    }

    #getJavaDir(majorVersion: number) {
        return join(StorageHelper.javaDir, majorVersion.toString());
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
    name: string;
    java_version: Array<number>;
    openjdk_build_number: number;
    latest: boolean;
    download_url: URL;
    product: string;
    availability_type: string;
    distro_version: Array<number>;
}
