import os from 'os';

import { SettingsFormat } from './ISettings';
import { StorageHelper } from './StorageHelper';

export class SettingsHelper {
    static defaultsValue(): SettingsFormat {
        return {
            token: '0',
            dir: StorageHelper.getPlatformStorageDir(),
            autoLogin: false,
            fullScreen: false,
            memory: 1024,
            startDebug: false,
        };
    }

    static getAllFields(): SettingsFormat {
        return StorageHelper.getStore().get('client');
    }

    static getField(name: string) {
        return StorageHelper.getStore().get('client.' + name);
    }

    static setField(field: string, value: string | boolean | number): void {
        return StorageHelper.getStore().set('client.' + field, value);
    }

    static getTotalMemory() {
        const remainingMemMegabytes = Math.floor(os.totalmem() / 1024 ** 2) / 2;

        return (
            remainingMemMegabytes -
            (remainingMemMegabytes % 1024) +
            (remainingMemMegabytes % 1024 ? 1024 : 0)
        );
    }
}
