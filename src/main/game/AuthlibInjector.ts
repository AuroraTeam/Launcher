import { existsSync } from 'fs';
import { join } from 'path';

import { HashHelper, HttpHelper } from '@aurora-launcher/core';
import { Service } from 'typedi';

import { LogHelper } from '../helpers/LogHelper';
import { StorageHelper } from '../helpers/StorageHelper';

@Service()
export class AuthlibInjector {
    readonly authlibFilePath = join(StorageHelper.storageDir, 'authlib.jar');

    async verify() {
        if (!existsSync(this.authlibFilePath)) {
            await this.#downloadAuthlib();
        }
        LogHelper.info('Authlib loaded successfully');
    }

    async #downloadAuthlib() {
        const apiUrl =
            'https://authlib-injector.yushi.moe/artifact/latest.json';

        let authlibData: AuthlibData;
        try {
            authlibData = await HttpHelper.getResourceFromJson(apiUrl);
        } catch (error) {
            LogHelper.error('Failed to check Authlib Injector API');
            LogHelper.debug(error);
            return;
        }

        try {
            await HttpHelper.downloadFile(
                authlibData.download_url,
                this.authlibFilePath,
            );
        } catch (error) {
            LogHelper.error('Failed to download Authlib Injector');
            LogHelper.debug(error);
            return;
        }

        const fileHash = await HashHelper.getHashFromFile(
            this.authlibFilePath,
            'sha256',
        );
        if (fileHash !== authlibData.checksums.sha256) {
            LogHelper.error('Authlib checksum mismatch');
            return;
        }

        LogHelper.info('Authlib downloaded successfully');
    }
}

interface AuthlibData {
    download_url: string;
    checksums: {
        sha256: string;
    };
}
