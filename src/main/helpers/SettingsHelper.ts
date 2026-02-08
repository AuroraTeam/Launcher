import { randomUUID } from 'crypto';

import Store from 'electron-store';

import { SettingsFormat } from '../../common/types';
import { LogHelper } from './LogHelper';
import { StorageHelper } from './StorageHelper';

export class SettingsHelper {
    private static store = new Store<SettingsFormat>({
        cwd: StorageHelper.storageDir,
        defaults: this.defaultsValue(),
    });

    static {
        const dir = this.store.get('dir');
        if (dir && dir !== StorageHelper.storageDir) {
            StorageHelper.changeStorageDir(dir);
        }
    }

    static async migration(path: string) {
        await StorageHelper.migration(path);
        StorageHelper.changeStorageDir(path);
        this.setField('dir', path);
        LogHelper.info('Migration completed successfully');
    }

    static defaultsValue(): SettingsFormat {
        return {
            username: '',
            userUUID: '',
            accessToken: '',
            clientToken: randomUUID(),
            dir: StorageHelper.storageDir,
            autoConnect: false,
            fullScreen: false,
            startDebug: false,
            clients: [],
        };
    }

    static getStore() {
        return this.store;
    }

    static getAllFields(): SettingsFormat {
        return this.store.store;
    }

    static getField<T extends keyof SettingsFormat>(name: T) {
        return this.store.get(name);
    }

    static setField<T extends keyof SettingsFormat>(
        field: T,
        value: SettingsFormat[T],
    ): void {
        return this.store.set(field, value);
    }
}
