import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class StorageHelper {
    // static storageDir: string = (process.env.DEV || false) ? __dirname : join(__dirname, '../game')
    static storageDir: string = __dirname;
    static assetsDir: string = join(StorageHelper.storageDir, 'assets');
    static clientsDir: string = join(StorageHelper.storageDir, 'clients');
    static librariesDir: string = join(StorageHelper.storageDir, 'libraries');
    static logFile: string = join(StorageHelper.storageDir, 'Launcher.log');

    static createMissing(): void {
        if (!existsSync(this.assetsDir)) mkdirSync(this.assetsDir);
        if (!existsSync(this.clientsDir)) mkdirSync(this.clientsDir);
        if (!existsSync(this.librariesDir)) mkdirSync(this.librariesDir);
    }
}

// TODO rework clients (assetsDir, clientsDir, librariesDir)
