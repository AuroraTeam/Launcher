import { spawn } from 'child_process';
import { delimiter, join } from 'path';

import {
    Profile,
    ProfileLibrary,
    Server,
    ZipHelper,
} from '@aurora-launcher/core';
import { api as apiConfig } from '@config';
import { Service } from '@freshgum/typedi';
import { app } from 'electron';
import { coerce, gte, lte } from 'semver';

import { Session } from '../../common/types';
import { LauncherWindow } from '../../main/core/LauncherWindow';
import { LogHelper } from '../../main/helpers/LogHelper';
import { SettingsHelper } from '../../main/helpers/SettingsHelper';
import { StorageHelper } from '../../main/helpers/StorageHelper';
import { AuthorizationService } from '../api/AuthorizationService';
import { PlatformHelper } from '../helpers/PlatformHelper';
import { AuthlibInjector } from './AuthlibInjector';
import { GameWindow } from './GameWindow';
import { JavaManager } from './JavaManager';
import { Watcher } from './Watcher';

@Service([
    LauncherWindow,
    AuthorizationService,
    GameWindow,
    JavaManager,
    AuthlibInjector,
])
export class Starter {
    #clientDir!: string;
    #nativesDirectory!: string;

    constructor(
        private LauncherWindow: LauncherWindow,
        private authorizationService: AuthorizationService,
        private gameWindow: GameWindow,
        private javaManager: JavaManager,
        private authlibInjector: AuthlibInjector,
    ) {}

    async prestart(profile: Profile) {
        this.#clientDir = join(StorageHelper.clientsDir, profile.clientDir);
        this.#nativesDirectory = join(this.#clientDir, 'natives');

        await this.authlibInjector.verify();

        await this.javaManager.checkAndDownloadJava(
            profile.javaVersion,
            this.gameWindow,
        );

        const nativesFiles = this.prepareNatives(
            this.#nativesDirectory,
            profile.libraries,
        );
        // TODO: add support legacy assets

        return { nativesFiles };
    }

    async start(
        profile: Profile,
        libraries: ProfileLibrary[],
        server: Server,
        watcher: Watcher,
    ) {
        const settings = SettingsHelper.getAllFields();

        const clientVersion = coerce(profile.version);
        if (clientVersion === null) throw new Error('Invalig client version');

        const userArgs = this.authorizationService.getCurrentSession();
        if (!userArgs) throw new Error('Auth requierd');

        const gameArgs: string[] = [];

        gameArgs.push('--version', profile.version);
        gameArgs.push('--gameDir', this.#clientDir);
        gameArgs.push('--assetsDir', StorageHelper.assetsDir);

        if (gte(clientVersion, '1.6.0')) {
            this.gameLauncher(
                gameArgs,
                profile,
                clientVersion.version,
                userArgs,
                server,
            );
        } else {
            gameArgs.push(userArgs.username);
            gameArgs.push(userArgs.accessToken);
        }

        const classPath = libraries
            .filter((lib) => lib.type === 'library' && !lib.ignoreClassPath)
            .map(({ path }) => join(StorageHelper.librariesDir, path));
        classPath.push(join(this.#clientDir, profile.gameJar));

        const jvmArgs = [];

        jvmArgs.push(
            `-javaagent:${this.authlibInjector.authlibFilePath}=${apiConfig.web}`,
        );
        jvmArgs.push(`-Xmx` + settings.memory + `M`);

        jvmArgs.push(`-Djava.library.path=${this.#nativesDirectory}`);

        if (gte(clientVersion, '1.20.0')) {
            jvmArgs.push(
                `-Djna.tmpdir=${this.#nativesDirectory}`,
                `-Dorg.lwjgl.system.SharedLibraryExtractPath=${this.#nativesDirectory}`,
                `-Dio.netty.native.workdir=${this.#nativesDirectory}`,
            );
        }

        jvmArgs.push(
            ...profile.jvmArgs.map((arg) =>
                arg
                    .replaceAll(
                        '${library_directory}',
                        StorageHelper.librariesDir,
                    )
                    .replaceAll('${classpath_separator}', delimiter)
                    .replaceAll(
                        '${version_name}',
                        profile.gameJar.replace('.jar', ''),
                    ),
            ),
        );

        if (PlatformHelper.isMac) {
            jvmArgs.push('-XstartOnFirstThread');
        }

        jvmArgs.push('-cp', classPath.join(delimiter));
        jvmArgs.push(profile.mainClass);

        jvmArgs.push(...gameArgs);
        jvmArgs.push(...profile.clientArgs);

        const gameProcess = spawn(
            await this.javaManager.getJavaPath(profile.javaVersion),
            jvmArgs,
            { cwd: this.#clientDir },
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
            watcher.stop();
            LogHelper.info('Game stop');
            this.LauncherWindow.showWindow();
        });

        return { gameProcess };
    }
    private gameLauncher(
        gameArgs: string[],
        clientArgs: Profile,
        clientVersion: string,
        userArgs: Session,
        server: Server,
    ): void {
        const settings = SettingsHelper.getAllFields();
        gameArgs.push('--username', userArgs.username);

        if (gte(clientVersion, '1.7.2')) {
            gameArgs.push('--uuid', userArgs.userUUID);
            gameArgs.push('--accessToken', userArgs.accessToken);
            if (settings.fullScreen) gameArgs.push('--fullscreen', 'true');

            if (settings.autoConnect) {
                if (gte(clientVersion, '1.20.0')) {
                    if (server.serverInfo?.hostname !== undefined) gameArgs.push('--quickPlayMultiplayer', server.serverInfo.hostname); 
                    else gameArgs.push('--quickPlayMultiplayer', server.serverInfo.ip + ':' + server.serverInfo.port.toString());
                } else {
                    if (server.serverInfo?.hostname !== undefined) gameArgs.push('--server', server.serverInfo.hostname); 
                    else {
                        gameArgs.push('--server', server.serverInfo.ip);
                        gameArgs.push('--port', server.serverInfo.port.toString());
                    }
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
                // TODO get launcher name from config
                gameArgs.push(
                    '--versionType',
                    `AuroraLauncher v${app.getVersion()}`,
                );
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
