import { StorageHelper } from './StorageHelper'
import os from 'os';
import { SettingsFormat } from './ISettings';

export class SettingsHelper {
    static defaultsValue(): SettingsFormat {
        return {
            token: '0',
            autoLogin: false,
            fullScreen: false,
            memory: 1024,
            startDebug: false
        };
    }

    static get(): SettingsFormat {
        return StorageHelper.getStore().get('client');
    }

    static getField(name: string): SettingsFormat {
        return StorageHelper.getStore().get('client.' + name);
    }

    static setField(field: string, value: string | boolean | number): void {
        return StorageHelper.getStore().set('client.' + field, value);
    }

    static getTotalMemory()  {
        let total_memory = os.totalmem();
        total_memory /= 2 ** 20;
        let default_mem = 2048;
        if (total_memory > 6e3) default_mem += 1024;
        if (total_memory > 16e3) default_mem += 2048;
    
        return  default_mem;
    }
}
