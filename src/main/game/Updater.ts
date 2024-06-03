import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { dirname, join } from 'path';

import {
    HashHelper,
    HttpHelper,
    JsonHelper,
    MojangAssets,
    Profile,
    ProfileLibrary,
} from '@aurora-launcher/core';
import { api as apiConfig } from '@config';
import { StorageHelper } from '../../main/helpers/StorageHelper';
import pMap from 'p-map';
import { Service } from 'typedi';

import { LoadProgress } from '../../common/types';
import { APIManager } from '../api/APIManager';
import { GameWindow } from './GameWindow';
import { retry } from '../utils/retry'

@Service()
export class Updater {
    constructor(
        private api: APIManager,
        private gameWindow: GameWindow,
    ) {}

    async validateClient(
        clientArgs: Profile,
        libraries: ProfileLibrary[],
    ): Promise<void> {
        await this.validateAssets(clientArgs.assetIndex);
        await this.validateLibraries(libraries);
        await this.validateGameFiles(clientArgs);
    }

    async validateAssets(assetIndex: string): Promise<void> {
        this.gameWindow.sendToConsole('Load assets files');

        const assetIndexPath = `indexes/${assetIndex}.json`;
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

        const total = assetsHashes.reduce((prev, cur) => prev + cur.size, 0);
        const updateProgress = this.createProgressUpdater(total, 'size');

        try {
            await pMap(
                assetsHashes,
                async (hash) => {
                    await retry(
                        () => this.checkAndDownloadFile(
                            hash.path,
                            StorageHelper.assetsDir,
                            'assets',
                        ),
                        3, 
                        1000 
                    );
            
                    updateProgress(hash.size);
                },
                { concurrency: 4 },
            );
        } catch (error)  {
            throw new Error(`p-map error ${error}`);
        }

        this.gameWindow.sendToConsole('Assets files loaded');
    }

    async validateLibraries(libraries: ProfileLibrary[]): Promise<void> {
        this.gameWindow.sendToConsole('Load libraries files');

        const updateProgress = this.createProgressUpdater(
            libraries.length,
            'count',
        );

        await pMap(
            libraries,
            async (library) => {
                await this.validateAndDownloadFile(
                    library.path,
                    library.sha1,
                    StorageHelper.librariesDir,
                    'libraries',
                );

                updateProgress();
            },
            { concurrency: 4 },
        );

        this.gameWindow.sendToConsole('Libraries files loaded');
    }

    async validateGameFiles(clientArgs: Profile): Promise<void> {
        this.gameWindow.sendToConsole('Load client files');

        const hashes = await this.api.getUpdates(clientArgs.clientDir);
        if (!hashes) throw new Error('Client not found');

        hashes.sort((a, b) => b.size - a.size);
        const total = hashes.reduce((prev, cur) => prev + cur.size, 0);
        const updateProgress = this.createProgressUpdater(total, 'size');

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

                updateProgress(hash.size);
            },
            { concurrency: 4 },
        );

        this.gameWindow.sendToConsole('Client files loaded');
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

    private createProgressUpdater(total: number, type: LoadProgress['type']) {
        let loaded = 0;

        return (size?: number) => {
            this.gameWindow.sendProgress({
                total,
                loaded: (loaded += size || 1),
                type,
            });
        };
    }
}
