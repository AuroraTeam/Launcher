import { cpSync, existsSync, mkdirSync, rmSync } from 'fs';
import { homedir } from 'os';
import { resolve } from 'path';

import { appPath } from '@config';
import { app } from 'electron';
import Store from 'electron-store';

import { LogHelper } from '../helpers/LogHelper';
import { PlatformHelper } from './PlatformHelper';
import { SettingsHelper } from './SettingsHelper';

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
        this.store = new Store({
            cwd: StorageHelper.storageDir,
            defaults: {
                client: SettingsHelper.defaultsValue(),
            },
        });
        if (
            this.store.get('client.dir') &&
            this.store.get('client.dir') !== this.storageDir
        ) {
            this.assetsDir = resolve(this.store.get('client.dir'), 'assets');
            this.librariesDir = resolve(
                this.store.get('client.dir'),
                'libraries',
            );
            this.clientsDir = resolve(this.store.get('client.dir'), 'clients');
            this.javaDir = resolve(this.store.get('client.dir'), 'java');
        } else {
            if (!existsSync(this.assetsDir)) mkdirSync(this.assetsDir);
            if (!existsSync(this.clientsDir)) mkdirSync(this.clientsDir);
            if (!existsSync(this.librariesDir)) mkdirSync(this.librariesDir);
            if (!existsSync(this.javaDir)) mkdirSync(this.javaDir);
        }
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

    static migration(path: string) {
        cpSync(this.assetsDir, resolve(path, 'assets'), { recursive: true });
        rmSync(this.assetsDir, { recursive: true });
        this.assetsDir = resolve(path, 'assets');
        LogHelper.info('Assets migration completed successfully');

        cpSync(this.librariesDir, resolve(path, 'libraries'), {
            recursive: true,
        });
        rmSync(this.librariesDir, { recursive: true });
        this.librariesDir = resolve(path, 'libraries');
        LogHelper.info('Libraries migration completed successfully');

        cpSync(this.clientsDir, resolve(path, 'clients'), { recursive: true });
        rmSync(this.clientsDir, { recursive: true });
        this.clientsDir = resolve(path, 'clients');
        LogHelper.info('Clients migration completed successfully');

        cpSync(this.javaDir, resolve(path, 'java'), { recursive: true });
        rmSync(this.javaDir, { recursive: true });
        this.javaDir = resolve(path, 'java');
        LogHelper.info('Java migration completed successfully');

        SettingsHelper.setField('dir', path);
        LogHelper.info('Migration completed successfully');
    }
}
