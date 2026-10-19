import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'fs/promises';
import { join } from 'path';

import { HashHelper, HttpHelper } from '@aurora-launcher/core';
import { Service } from '@freshgum/typedi';

import { LogHelper } from '../helpers/LogHelper';
import { StorageHelper } from '../helpers/StorageHelper';

@Service([])
export class AuthlibInjector {
    readonly authlibFilePath = join(StorageHelper.storageDir, 'authlib.jar');
    private readonly checksumPath = `${this.authlibFilePath}.sha256`;
    private verification?: Promise<void>;

    verify(): Promise<void> {
        return (this.verification ??= this.ensureAuthlib()
            .then(() => {
                LogHelper.info('Authlib loaded successfully');
            })
            .finally(() => {
                this.verification = undefined;
            }));
    }

    private async matchesChecksum(checksum: string): Promise<boolean> {
        if (!/^[a-f\d]{64}$/i.test(checksum)) return false;
        try {
            return await HashHelper.compareFileHash(
                this.authlibFilePath,
                'sha256',
                checksum.toLowerCase(),
            );
        } catch {
            return false;
        }
    }

    private async ensureAuthlib(): Promise<void> {
        const storedChecksum = await readFile(this.checksumPath, 'utf8').catch(
            () => '',
        );
        if (await this.matchesChecksum(storedChecksum.trim())) return;

        let metadata: AuthlibData;
        try {
            metadata = await HttpHelper.getResourceFromJson<AuthlibData>(
                'https://authlib-injector.yushi.moe/artifact/latest.json',
            );
        } catch (error) {
            throw new Error('Failed to check Authlib Injector API', {
                cause: error,
            });
        }
        const checksum = metadata.checksums?.sha256;
        if (
            !metadata.download_url ||
            !checksum ||
            !/^[a-f\d]{64}$/i.test(checksum)
        ) {
            throw new Error('Invalid Authlib Injector metadata');
        }

        await mkdir(StorageHelper.storageDir, { recursive: true });
        const stagingDir = await mkdtemp(
            join(StorageHelper.storageDir, '.authlib-'),
        );
        try {
            if (!(await this.matchesChecksum(checksum))) {
                const downloadPath = join(stagingDir, 'authlib.jar');
                await HttpHelper.downloadFile(
                    metadata.download_url,
                    downloadPath,
                );
                if (
                    !(await HashHelper.compareFileHash(
                        downloadPath,
                        'sha256',
                        checksum.toLowerCase(),
                    ))
                ) {
                    throw new Error('Authlib checksum mismatch');
                }
                await rename(downloadPath, this.authlibFilePath);
            }
            const checksumFile = join(stagingDir, 'checksum');
            await writeFile(checksumFile, checksum.toLowerCase());
            await rename(checksumFile, this.checksumPath);
        } finally {
            await rm(stagingDir, { recursive: true, force: true });
        }
    }
}

interface AuthlibData {
    download_url: string;
    checksums: { sha256: string };
}
