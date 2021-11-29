import { ipcMain, IpcMainEvent } from 'electron';

import { join, delimiter } from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { gte, lte } from 'semver';
import Launcher from 'main/core/Launcher';
import ClientArgs from './IClientArgs';
import Updater from './Updater';
import { StorageHelper } from 'main/helpers/StorageHelper';
import { LogHelper } from 'main/helpers/LogHelper';

// TODO Проверить версии не соответствующие semver формату
// UPD Можно прогонять версию перед сравнениями через semver.coerce()
// Либо внести соглашение о формате версий (хотя хз)

export default class Starter {
    static setHandler(): void {
        ipcMain.on('startGame', (event, clientArgs) =>
            Starter.startGame(event, clientArgs)
        );
    }

    static async startGame(
        event: IpcMainEvent,
        clientArgs: ClientArgs
    ): Promise<void> {
        try {
            await Updater.checkClient(event, clientArgs);
        } catch (_) {
            event.reply('stopGame');
            return;
        }
        await this.start(event, clientArgs);
    }

    static async start(
        event: IpcMainEvent,
        clientArgs: ClientArgs
    ): Promise<void> {
        const clientDir = join(StorageHelper.clientsDir, clientArgs.clientDir);
        const assetsDir = join(StorageHelper.assetsDir, clientArgs.assetsDir);

        const gameArgs: string[] = [];

        // TODO Проверить, можно ли вынести указание версии, папки клиента и ассетов сюда и не отъебнёт ли запуск на легаси
        // (хотя параметры можно указать после блока if)
        if (gte(clientArgs.version, '1.6.0')) {
            this.gameLauncher(gameArgs, clientArgs, clientDir, assetsDir);
        } else {
            this.gameLauncherLegacy(gameArgs, clientArgs, clientDir, assetsDir);
        }

        const librariesDirectory = join(clientDir, 'libraries');
        const nativesDirectory = join(clientDir, 'natives');

        const classPath: string[] = [];
        if (clientArgs.classPath !== undefined) {
            clientArgs.classPath.forEach((fileName) => {
                const filePath = join(clientDir, fileName);
                if (fs.statSync(filePath).isDirectory()) {
                    classPath.push(...this.scanDir(librariesDirectory));
                } else {
                    classPath.push(filePath);
                }
            });
        } else {
            Launcher.window.sendEvent('textToConsole', 'classPath is empty');
            LogHelper.error('classPath is empty');
            return;
        }

        const jvmArgs = [];

        // TODO Убрать костыль
        // jvmArgs.push(
        //     '-javaagent:../../authlib-injector.jar=http://localhost:1370'
        // );

        jvmArgs.push(`-Djava.library.path=${nativesDirectory}`);

        if (clientArgs.jvmArgs?.length > 0) {
            jvmArgs.push(...clientArgs.jvmArgs);
        }

        jvmArgs.push('-cp', classPath.join(delimiter));
        jvmArgs.push(clientArgs.mainClass);

        jvmArgs.push(...gameArgs);
        if (clientArgs.clientArgs?.length > 0) {
            jvmArgs.push(...clientArgs.clientArgs);
        }

        const gameProccess = spawn('java', jvmArgs, {
            cwd: clientDir,
        });

        gameProccess.stdout.on('data', (data: Buffer) => {
            Launcher.window.sendEvent('textToConsole', data.toString());
            LogHelper.info(data.toString());
        });

        gameProccess.stderr.on('data', (data: Buffer) => {
            Launcher.window.sendEvent('textToConsole', data.toString());
            LogHelper.error(data.toString());
        });

        gameProccess.on('close', () => {
            event.reply('stopGame');
            LogHelper.info('Game stop');
        });
    }

    private static scanDir(dir: string, list: string[] = []): string[] {
        if (fs.statSync(dir).isDirectory()) {
            for (const fdir of fs.readdirSync(dir)) {
                this.scanDir(join(dir, fdir), list);
            }
        } else {
            list.push(dir);
        }
        return list;
    }

    static gameLauncher(
        gameArgs: string[],
        clientArgs: ClientArgs,
        clientDir: string,
        assetsDir: string
    ): void {
        gameArgs.push('--username', clientArgs.username);
        gameArgs.push('--version', clientArgs.version);
        gameArgs.push('--gameDir', clientDir);
        gameArgs.push('--assetsDir', assetsDir);

        if (gte(clientArgs.version, '1.7.2')) {
            gameArgs.push('--uuid', clientArgs.userUUID);
            gameArgs.push('--accessToken', clientArgs.accessToken);

            if (gte(clientArgs.version, '1.7.3')) {
                gameArgs.push('--assetIndex', clientArgs.assetsIndex);

                if (lte(clientArgs.version, '1.9.0')) {
                    gameArgs.push('--userProperties', '{}');
                }
            }

            if (gte(clientArgs.version, '1.7.4')) {
                gameArgs.push('--userType', 'mojang');
            }

            if (gte(clientArgs.version, '1.9.0')) {
                gameArgs.push('--versionType', 'AuroraLauncher v0.0.3');
            }
        } else {
            gameArgs.push('--session', clientArgs.accessToken);
        }
    }

    static gameLauncherLegacy(
        gameArgs: string[],
        clientArgs: ClientArgs,
        clientDir: string,
        assetsDir: string
    ): void {
        gameArgs.push(clientArgs.username);
        gameArgs.push(clientArgs.accessToken);
        gameArgs.push('--version', clientArgs.version);
        gameArgs.push('--gameDir', clientDir);
        gameArgs.push('--assetsDir', assetsDir);
    }
}
