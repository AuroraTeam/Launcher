import { existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { resolve } from 'path';

import { appPath } from '@config';
import { app } from 'electron';

import { PlatformHelper } from './PlatformHelper';

export class StorageHelper {
    static storageDir: string = this.getPlatformStorageDir();
    static assetsDir: string = resolve(StorageHelper.storageDir, 'assets');
    static clientsDir: string = resolve(StorageHelper.storageDir, 'clients');
    static librariesDir: string = resolve(
        StorageHelper.storageDir,
        'libraries',
    );
    static javaDir: string = resolve(StorageHelper.storageDir, 'java');
    static logFile: string = resolve(StorageHelper.storageDir, 'Launcher.log');

    static createMissing(): void {
        if (!existsSync(this.storageDir)) mkdirSync(this.storageDir);
        if (!existsSync(this.assetsDir)) mkdirSync(this.assetsDir);
        if (!existsSync(this.clientsDir)) mkdirSync(this.clientsDir);
        if (!existsSync(this.librariesDir)) mkdirSync(this.librariesDir);
        if (!existsSync(this.javaDir)) mkdirSync(this.javaDir);
    }

    private static getPlatformStorageDir() {
        if (PlatformHelper.isMac) {
            return resolve(app.getPath('userData'), '../', appPath);
        }
        return resolve(homedir(), appPath);
    }
}
