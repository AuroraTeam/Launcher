import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { dirname, join } from 'path';

import {
    HashHelper,
    HttpHelper,
    JsonHelper,
    MojangAssets,
    Profile,
} from '@aurora-launcher/core';
import { api as apiConfig } from '@config';
import { StorageHelper } from 'main/helpers/StorageHelper';
import pMap from 'p-map';
import { Service } from 'typedi';

import { APIManager } from '../api/APIManager';
import { GameWindow } from './GameWindow';
import { LibrariesMatcher } from './LibrariesMatcher';

@Service()
export class Updater {
    constructor(
        private api: APIManager,
        private gameWindow: GameWindow,
    ) {}

    async validateClient(clientArgs: Profile): Promise<void> {
        await this.validateAssets(clientArgs);
        await this.validateLibraries(clientArgs);
        await this.validateGameFiles(clientArgs);
    }

    async validateAssets(clientArgs: Profile): Promise<void> {
        this.gameWindow.sendToConsole('Load assets files');

        const assetIndexPath = `indexes/${clientArgs.assetIndex}.json`;
        const filePath = join(StorageHelper.assetsDir, assetIndexPath);
        mkdirSync(dirname(filePath), { recursive: true });

        const assetIndexUrl = this.getFileUrl(assetIndexPath, 'assets');
        const assetFile = await HttpHelper.getResource(assetIndexUrl);
        await writeFile(filePath, assetFile);

        const { objects } = JsonHelper.fromJson<MojangAssets>(assetFile);

        const assetsHashes = Object.values(objects)
            .sort((a, b) => b.size - a.size)
            .map((hash) => ({
                ...hash,
                path: `objects/${hash.hash.slice(0, 2)}/${hash.hash}`,
            }));

        const totalSize = assetsHashes.reduce(
            (prev, cur) => prev + cur.size,
            0,
        );
        let loaded = 0;

        await pMap(
            assetsHashes,
            async (hash) => {
                await this.checkAndDownloadFile(
                    hash.path,
                    StorageHelper.assetsDir,
                    'assets',
                );

                this.gameWindow.sendProgress({
                    total: totalSize,
                    loaded: (loaded += hash.size),
                    type: 'size',
                });
            },
            { concurrency: 4 },
        );
    }

    async validateLibraries(clientArgs: Profile): Promise<void> {
        this.gameWindow.sendToConsole('Load libraries files');

        const usedLibraries = clientArgs.libraries.filter((library) =>
            LibrariesMatcher.match(library.rules),
        );

        let loaded = 0;

        await pMap(
            usedLibraries,
            async (library) => {
                await this.validateAndDownloadFile(
                    library.path,
                    library.sha1,
                    StorageHelper.librariesDir,
                    'libraries',
                );

                this.gameWindow.sendProgress({
                    total: usedLibraries.length,
                    loaded: (loaded += 1),
                    type: 'count',
                });
            },
            { concurrency: 4 },
        );
    }

    async validateGameFiles(clientArgs: Profile): Promise<void> {
        this.gameWindow.sendToConsole('Load client files');

        const hashes = await this.api.getUpdates(clientArgs.clientDir);
        if (!hashes) {
            throw new Error('Client not found');
        }

        hashes.sort(
            (a: { size: number }, b: { size: number }) => b.size - a.size,
        );
        const totalSize = hashes.reduce(
            (prev: any, cur: { size: any }) => prev + cur.size,
            0,
        );
        let loaded = 0;

        const verifyArray = clientArgs.update.concat(clientArgs.updateVerify);
        await pMap(
            hashes,
            async (hash) => {
                await this.checkAndDownloadFile(
                    hash.path,
                    StorageHelper.clientsDir,
                    'clients',
                );

                const filteredPath = hash.path
                    .replace(/\\/g, '/')
                    .replace(`/${clientArgs.clientDir}/`, '');

                if (
                    verifyArray.find((u) => u.startsWith(filteredPath)) &&
                    !clientArgs.updateExclusions.find((u) =>
                        u.startsWith(filteredPath),
                    )
                ) {
                    await this.validateAndDownloadFile(
                        hash.path,
                        hash.sha1,
                        StorageHelper.clientsDir,
                        'clients',
                    );
                }

                this.gameWindow.sendProgress({
                    total: totalSize,
                    loaded: (loaded += hash.size),
                    type: 'size',
                });
            },
            { concurrency: 4 },
        );
    }

    private getFileUrl(
        path: string,
        type: 'clients' | 'libraries' | 'assets',
    ): URL {
        return new URL(join('files', type, path), apiConfig.web);
    }

    private async validateAndDownloadFile(
        path: string,
        sha1: string,
        rootDir: string,
        type: 'clients' | 'libraries' | 'assets',
    ): Promise<void> {
        const filePath = join(rootDir, path);
        const fileUrl = this.getFileUrl(path, type);

        try {
            const fileHash = await HashHelper.getHashFromFile(filePath, 'sha1');
            if (fileHash === sha1) return;
        } catch (error) {
            // ignore not found file
        }

        try {
            await HttpHelper.downloadFile(fileUrl, filePath);
        } catch (error) {
            throw new Error(`file ${fileUrl} not found`);
        }
    }

    private async checkAndDownloadFile(
        path: string,
        rootDir: string,
        type: 'clients' | 'libraries' | 'assets',
    ): Promise<void> {
        const filePath = join(rootDir, path);
        const fileUrl = this.getFileUrl(path, type);

        if (existsSync(filePath)) return;

        try {
            await HttpHelper.downloadSafeFile(fileUrl, filePath);
        } catch (error) {
            throw new Error(`file ${fileUrl} not found`);
        }
    }
}
