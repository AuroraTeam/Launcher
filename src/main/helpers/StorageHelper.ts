import { cp, rename, rm } from 'fs/promises';
import { homedir } from 'os';
import { resolve } from 'path';

import { StorageHelper as CoreStorageHelper } from '@aurora-launcher/core';
import { appPath } from '@config';
import { app } from 'electron';

import { PlatformHelper } from './PlatformHelper';

export class StorageHelper extends CoreStorageHelper {
    static readonly storageDir = this.getStorageDir();
    static readonly assetsDir = this.resolveDir('assets');
    static readonly clientsDir = this.resolveDir('clients');
    static readonly librariesDir = this.resolveDir('libraries');
    static readonly javaDir = this.resolveDir('java');

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
