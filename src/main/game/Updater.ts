import { IpcMainEvent } from 'electron/main';
import { Launcher } from 'main/core/Launcher';
import { HttpHelper } from 'main/helpers/HttpHelper';
import { StorageHelper } from 'main/helpers/StorageHelper';
import pMap from 'p-map';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { api as apiConfig } from '@config';
import { ClientArgs } from './IClientArgs';
import { LogHelper } from 'main/helpers/LogHelper';

type DirType = 'Assets' | 'Client'; // Enum?

export class Updater {
    static async checkClient(
        _event: IpcMainEvent,
        clientArgs: ClientArgs
    ): Promise<void> {
        await this.hash(_event, 'Assets', clientArgs.assetsDir);
        await this.hash(_event, 'Client', clientArgs.clientDir);
    }

    static async hash(
        _event: IpcMainEvent,
        type: DirType,
        dir: string
    ): Promise<void> {
        const parentDir = Updater.getParentDir(type);
        if (!existsSync(join(parentDir, dir))) {
            await this.download(dir, type);
        } else {
            // TODO Здесь должен быть код, который будет проверять хеш файлов
        }
    }

    static async download(dir: string, type: DirType): Promise<void> {
        const parentDir = Updater.getParentDir(type);
        Launcher.window.sendEvent(
            'textToConsole',
            `Load ${type.toLowerCase()} files\n`
        );

        const hashes = await Launcher.api.getUpdates(dir);
        if (!hashes) {
            Launcher.window.sendEvent('textToConsole', `${type} not found\n`);
            LogHelper.error(`${type} not found`);
            throw undefined; // Ну можно и получше что-то придумать
        }

        hashes.sort((a, b) => b.size - a.size);
        const totalSize = hashes.reduce((prev, cur) => prev + cur.size, 0);
        let loaded = 0;

        await pMap(
            hashes,
            async (hash) => {
                const filePath = join(parentDir, hash.path);
                mkdirSync(dirname(filePath), { recursive: true });
                await HttpHelper.downloadFile(
                    new URL(
                        `files/${hash.path.replace('\\', '/')}`,
                        apiConfig.web
                    ),
                    filePath
                );
                Launcher.window.sendEvent(
                    'textToConsole',
                    `File ${hash.path} downloaded \n`
                );
                Launcher.window.sendEvent('loadProgress', {
                    total: totalSize,
                    loaded: (loaded += hash.size),
                });
            },
            { concurrency: 4 }
        );
    }

    private static getParentDir(type: DirType): string {
        return type === 'Assets'
            ? StorageHelper.assetsDir
            : StorageHelper.clientsDir;
    }
}
