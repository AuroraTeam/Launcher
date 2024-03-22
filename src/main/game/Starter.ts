import { spawn } from 'child_process';
import { delimiter, join } from 'path';

import { Profile, ZipHelper } from '@aurora-launcher/core';
import { api as apiConfig } from '@config';
import { LogHelper } from 'main/helpers/LogHelper';
import { StorageHelper } from 'main/helpers/StorageHelper';
import { coerce, gte, lte } from 'semver';
import { Service } from 'typedi';
import { LauncherWindow } from 'main/core/LauncherWindow';

import { Session } from '../../common/types';
import { AuthorizationService } from '../api/AuthorizationService';
import { PlatformHelper } from '../helpers/PlatformHelper';
import { AuthlibInjector } from './AuthlibInjector';
import { GameWindow } from './GameWindow';
import { JavaManager } from './JavaManager';
import { LibrariesMatcher } from './LibrariesMatcher';

@Service()
export class Starter {
    constructor(
        private LauncherWindow: LauncherWindow,
        private authorizationService: AuthorizationService,
        private gameWindow: GameWindow,
        private javaManager: JavaManager,
        private authlibInjector: AuthlibInjector,
    ) {}

    async start(clientArgs: Profile): Promise<void> {
        const clientDir = join(StorageHelper.clientsDir, clientArgs.clientDir);

        const clientVersion = coerce(clientArgs.version);
        if (clientVersion === null) {
            throw new Error('Invalig client version');
        }

        const userArgs = this.authorizationService.getCurrentSession();
        if (!userArgs) {
            throw new Error('Auth requierd');
        }

        const gameArgs: string[] = [];

        gameArgs.push('--version', clientArgs.version);
        gameArgs.push('--gameDir', clientDir);
        gameArgs.push('--assetsDir', StorageHelper.assetsDir);

        // TODO: add support legacy assets

        if (gte(clientVersion, '1.6.0')) {
            this.gameLauncher(
                gameArgs,
                clientArgs,
                clientVersion.version,
                userArgs,
            );
        } else {
            gameArgs.push(userArgs.username);
            gameArgs.push(userArgs.accessToken);
        }

        const classPath = clientArgs.libraries
            .filter(
                (library) =>
                    library.type === 'library' &&
                    !library.ignoreClassPath &&
                    LibrariesMatcher.match(library.rules),
            )
            .map(({ path }) => join(StorageHelper.librariesDir, path));
        classPath.push(join(clientDir, clientArgs.gameJar));

        const jvmArgs = [];

        await this.authlibInjector.verify();
        jvmArgs.push(
            `-javaagent:${this.authlibInjector.authlibFilePath}=${apiConfig.web}`,
        );

        const nativesDirectory = this.prepareNatives(clientArgs);
        jvmArgs.push(`-Djava.library.path=${nativesDirectory}`);

        if (gte(clientVersion, '1.20.0')) {
            jvmArgs.push(
                `-Djna.tmpdir=${nativesDirectory}`,
                `-Dorg.lwjgl.system.SharedLibraryExtractPath=${nativesDirectory}`,
                `-Dio.netty.native.workdir=${nativesDirectory}`,
            );
        }

        jvmArgs.push(
            ...clientArgs.jvmArgs.map((arg) =>
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
        jvmArgs.push(clientArgs.mainClass);

        jvmArgs.push(...gameArgs);
        jvmArgs.push(...clientArgs.clientArgs);

        await this.javaManager.checkAndDownloadJava(clientArgs.javaVersion);

        const gameProccess = spawn(
            await this.javaManager.getJavaPath(clientArgs.javaVersion),
            jvmArgs,
            { cwd: clientDir },
        );

        gameProccess.on('spawn',() => {
            this.LauncherWindow.hideWindow();
        });

        gameProccess.stdout.on('data', (data: Buffer) => {
            const log = data.toString().trim();
            this.gameWindow.sendToConsole(log);
            LogHelper.info(log);
        });

        gameProccess.stderr.on('data', (data: Buffer) => {
            const log = data.toString().trim();
            this.gameWindow.sendToConsole(log);
            LogHelper.error(log);
        });

        gameProccess.on('close', () => {
            this.gameWindow.stopGame();
            LogHelper.info('Game stop');
            this.LauncherWindow.showWindow();
        });
    }
    private gameLauncher(
        gameArgs: string[],
        clientArgs: Profile,
        clientVersion: string,
        userArgs: Session,
    ): void {
        gameArgs.push('--username', userArgs.username);

        if (gte(clientVersion, '1.7.2')) {
            gameArgs.push('--uuid', userArgs.userUUID);
            gameArgs.push('--accessToken', userArgs.accessToken);

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

    prepareNatives(clientArgs: Profile) {
        const nativesDir = join(
            StorageHelper.clientsDir,
            clientArgs.clientDir,
            'natives',
        );

        clientArgs.libraries
            .filter(
                (library) =>
                    library.type === 'native' &&
                    LibrariesMatcher.match(library.rules),
            )
            .forEach(({ path }) => {
                try {
                    ZipHelper.unzip(
                        join(StorageHelper.librariesDir, path),
                        nativesDir,
                        ['.so', '.dylib', '.jnilib', '.dll'],
                    );
                } catch (error) {
                    LogHelper.error(error);
                }
            });

        return nativesDir;
    }
}
