import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class StorageHelper {
    // static storageDir: string = (process.env.DEV || false) ? __dirname : join(__dirname, '../game')
    static storageDir: string = __dirname;
    static assetsDir: string = join(StorageHelper.storageDir, 'assets');
    static clientsDir: string = join(StorageHelper.storageDir, 'clients');
    static librariesDir: string = join(StorageHelper.storageDir, 'libraries');
    static logsDir: string = join(StorageHelper.storageDir, 'logs');
    static tempDir: string = join(StorageHelper.storageDir, 'temp');
    static logFile: string = join(StorageHelper.logsDir, 'Launcher.log');

    static createMissing(): void {
        if (!existsSync(this.assetsDir)) mkdirSync(this.assetsDir);
        if (!existsSync(this.clientsDir)) mkdirSync(this.clientsDir);
        if (!existsSync(this.librariesDir)) mkdirSync(this.librariesDir);
        if (!existsSync(this.logsDir)) mkdirSync(this.logsDir);
        if (!existsSync(this.tempDir)) mkdirSync(this.tempDir);
    }
}

// TODO delete logsDir, tempDir
// TODO rework clients (assetsDir, clientsDir, librariesDir)
