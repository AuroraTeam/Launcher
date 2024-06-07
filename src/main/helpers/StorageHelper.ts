import { appPath } from '@config'
import { app } from 'electron'
import { existsSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import { resolve } from 'path'
import { PlatformHelper } from './PlatformHelper'
import { SettingsHelper } from './SettingsHelper'
import Store from 'electron-store'

export class StorageHelper {
    
    static store: any;

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

        this.store = new Store({
            cwd: StorageHelper.storageDir,
            defaults: {
                client: SettingsHelper.defaultsValue()
            }
        })
    }

    static getStore() {
        return this.store;
    }

    private static getPlatformStorageDir() {
        if (PlatformHelper.isMac) {
            return resolve(app.getPath('userData'), '../', appPath);
        }
        return resolve(homedir(), appPath);
    }
    
}
