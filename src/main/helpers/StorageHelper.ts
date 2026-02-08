import { cp, rename, rm } from 'fs/promises';
import { homedir } from 'os';
import { resolve } from 'path';
import { join } from 'path/posix';

import { StorageHelper as CoreStorageHelper } from '@aurora-launcher/core';
import { appPath } from '@config';
import { app } from 'electron';

import { PlatformHelper } from './PlatformHelper';

export class StorageHelper extends CoreStorageHelper {
    static storageDir = this.getStorageDir();
    static assetsDir: string;
    static clientsDir: string;
    static librariesDir: string;
    static javaDir: string;

    private static resolveDirs() {
        this.assetsDir = this.resolveDir('assets');
        this.clientsDir = this.resolveDir('clients');
        this.librariesDir = this.resolveDir('libraries');
        this.javaDir = this.resolveDir('java');
    }

    static changeStorageDir(newPath: string) {
        this.storageDir = newPath;
        this.resolveDirs();
    }

    static async migration(path: string) {
        await this.move(this.assetsDir, join(path, 'assets'));
        await this.move(this.clientsDir, join(path, 'clients'));
        await this.move(this.librariesDir, join(path, 'libraries'));
        await this.move(this.javaDir, join(path, 'java'));
    }

    private static getStorageDir() {
        if (PlatformHelper.isMac) {
            return resolve(app.getPath('userData'), '../', appPath);
        }
        return resolve(homedir(), appPath);
    }

    static async move(src: string, dest: string) {
        try {
            await rename(src, dest);
        } catch (error: any) {
            if (error.code !== 'EXDEV') {
                throw error;
            }
            await cp(src, dest, { recursive: true });
            return rm(src, { recursive: true, force: true });
        }
    }

    static override resolveDir(dirname: string) {
        return super.resolveDir(this.storageDir, dirname);
    }
}
