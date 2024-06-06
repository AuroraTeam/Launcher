import { spawn } from 'child_process';
import { delimiter, join } from 'path';

import { Profile, ProfileLibrary, ZipHelper } from '@aurora-launcher/core';
import { api as apiConfig } from '@config';
import { LauncherWindow } from 'main/core/LauncherWindow';
import { LogHelper } from 'main/helpers/LogHelper';
import { StorageHelper } from 'main/helpers/StorageHelper';
import { coerce, gte, lte } from 'semver';
import { Service } from 'typedi';

import { Session } from '../../common/types';
import { AuthorizationService } from '../api/AuthorizationService';
import { PlatformHelper } from '../helpers/PlatformHelper';
import { AuthlibInjector } from './AuthlibInjector';
import { GameWindow } from './GameWindow';
import { JavaManager } from './JavaManager';
import { SettingsHelper } from '../../main/helpers/SettingsHelper';

@Service()
export class Starter {
    constructor(
        private LauncherWindow: LauncherWindow,
        private authorizationService: AuthorizationService,
        private gameWindow: GameWindow,
        private javaManager: JavaManager,
        private authlibInjector: AuthlibInjector,
    ) {}

    async start(profile: Profile, libraries: ProfileLibrary[]) {
        const settings = SettingsHelper.get();
        const clientDir = join(StorageHelper.clientsDir, profile.clientDir);

        const clientVersion = coerce(profile.version);
        if (clientVersion === null) throw new Error('Invalig client version');

        const userArgs = this.authorizationService.getCurrentSession();
        if (!userArgs) throw new Error('Auth requierd');

        const gameArgs: string[] = [];

        gameArgs.push('--version', profile.version);
        gameArgs.push('--gameDir', clientDir);
        gameArgs.push('--assetsDir', StorageHelper.assetsDir);

        // TODO: add support legacy assets

        if (gte(clientVersion, '1.6.0')) {
            this.gameLauncher(
                gameArgs,
                profile,
                clientVersion.version,
                userArgs,
            );
        } else {
            gameArgs.push(userArgs.username);
            gameArgs.push(userArgs.accessToken);
        }

        const classPath = libraries
            .filter((lib) => lib.type === 'library' && !lib.ignoreClassPath)
            .map(({ path }) => join(StorageHelper.librariesDir, path));
        classPath.push(join(clientDir, profile.gameJar));

        const jvmArgs = [];

        await this.authlibInjector.verify();
        jvmArgs.push(
            `-javaagent:${this.authlibInjector.authlibFilePath}=${apiConfig.web}`,
            `-Xmx` + settings.memory + `M`,
        );

        const nativesDirectory = join(clientDir, 'natives');
        const nativesFiles = this.prepareNatives(nativesDirectory, libraries);
        jvmArgs.push(`-Djava.library.path=${nativesDirectory}`);

        if (gte(clientVersion, '1.20.0')) {
            jvmArgs.push(
                `-Djna.tmpdir=${nativesDirectory}`,
                `-Dorg.lwjgl.system.SharedLibraryExtractPath=${nativesDirectory}`,
                `-Dio.netty.native.workdir=${nativesDirectory}`,
            );
        }

        jvmArgs.push(
            ...profile.jvmArgs.map((arg) =>
                arg
                    .replaceAll(
                        '${library_directory}',
                        StorageHelper.librariesDir,
                    )
                    .replaceAll('${classpath_separator}', delimiter),
            ),
        );

        if (PlatformHelper.isMac) {
            jvmArgs.push('-XstartOnFirstThread');
        }

        jvmArgs.push('-cp', classPath.join(delimiter));
        jvmArgs.push(profile.mainClass);

        jvmArgs.push(...gameArgs);
        jvmArgs.push(...profile.clientArgs);

        await this.javaManager.checkAndDownloadJava(profile.javaVersion);

        const gameProcess = spawn(
            await this.javaManager.getJavaPath(profile.javaVersion),
            jvmArgs,
            { cwd: clientDir },
        );

        gameProcess.on('spawn', () => {
            this.LauncherWindow.hideWindow();
        });

        gameProcess.stdout.on('data', (data: Buffer) => {
            const log = data.toString().trim();
            this.gameWindow.sendToConsole(log);
            LogHelper.info(log);
        });

        gameProcess.stderr.on('data', (data: Buffer) => {
            const log = data.toString().trim();
            this.gameWindow.sendToConsole(log);
            LogHelper.error(log);
        });

        gameProcess.on('close', () => {
            this.gameWindow.stopGame();
            LogHelper.info('Game stop');
            this.LauncherWindow.showWindow();
        });

        return { nativesFiles, gameProcess };
    }
    private gameLauncher(
        gameArgs: string[],
        clientArgs: Profile,
        clientVersion: string,
        userArgs: Session,
    ): void {
        const settings = SettingsHelper.get();
        gameArgs.push('--username', userArgs.username);

        if (gte(clientVersion, '1.7.2')) {
            gameArgs.push('--uuid', userArgs.userUUID);
            gameArgs.push('--accessToken', userArgs.accessToken);
            if (settings.fullScreen) gameArgs.push('--fullscreen', 'true')

            if (settings.autoLogin) {
                if (gte(clientVersion, '1.20.0')) {
                    gameArgs.push('--quickPlayMultiplayer', clientArgs.servers[0].ip + ':' + clientArgs.servers[0].port)
                } else {
                    gameArgs.push('--server', clientArgs.servers[0].ip)
                    gameArgs.push('--port', clientArgs.servers[0].port)
                }
            }

            if (gte(clientVersion, '1.7.3')) {
                gameArgs.push('--assetIndex', clientArgs.assetIndex);

                if (lte(clientVersion, '1.9.0')) {
                    gameArgs.push('--userProperties', '{}');
                }
            }

            if (gte(clientVersion, '1.7.4')) {
                gameArgs.push('--userType', 'mojang');
            }

            if (gte(clientVersion, '1.9.0')) {
                gameArgs.push('--versionType', 'AuroraLauncher v0.0.9');
            }
        } else {
            gameArgs.push('--session', userArgs.accessToken);
        }
    }

    prepareNatives(nativesDir: string, libraries: ProfileLibrary[]) {
        const nativesFiles: string[] = [];

        libraries
            .filter(({ type }) => type === 'native')
            .forEach(({ path }) => {
                try {
                    nativesFiles.push(
                        ...ZipHelper.unzip(
                            join(StorageHelper.librariesDir, path),
                            nativesDir,
                            ['.so', '.dylib', '.jnilib', '.dll'],
                        ),
                    );
                } catch (error) {
                    LogHelper.error(error);
                }
            });

        return nativesFiles;
    }
}
