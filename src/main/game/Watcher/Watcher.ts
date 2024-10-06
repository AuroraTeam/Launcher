import { join } from 'path';

import { HashHelper, HashedFile, ProfileLibrary } from '@aurora-launcher/core';
import { Service } from '@freshgum/typedi';
import { FSWatcher, watch } from 'chokidar';

import { LogHelper } from '../../helpers/LogHelper';
import { StorageHelper } from '../../helpers/StorageHelper';
import { IProcess } from './IProcess';
import { WatcherProfile } from './WatcherProfile';

// import pMap from 'p-map';

interface WathedFile {
    path: string;
    sha1: string;
}

@Service([])
export class Watcher {
    #needKill = false;
    #watcher?: FSWatcher;
    #gameProcess?: IProcess;

    #filesList: WathedFile[] = [];
    #clientDir!: string;
    #verifyList: string[] = [];
    #excludeList: string[] = [];

    setGameProcess(gameProcess: IProcess) {
        LogHelper.debug('[Watcher] Game process set');
        this.#gameProcess = gameProcess;
        if (this.#needKill) {
            gameProcess.kill();
            this.stop();
        }
    }

    async start(
        profile: WatcherProfile,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        libraries: ProfileLibrary[],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        natives: string[],
        gameFiles: HashedFile[],
    ) {
        this.#filesList = gameFiles.map(({ path, sha1 }) => ({
            path: this.#normalizePath(path),
            sha1,
        }));
        this.#clientDir = join(StorageHelper.clientsDir, profile.clientDir);

        this.#verifyList = profile.updateVerify.map((path) =>
            join(this.#clientDir, path),
        );
        this.#excludeList = profile.updateExclusions.map((path) =>
            join(this.#clientDir, path),
        );

        // const libs = libraries
        //     .filter((library) => library.type === 'library')
        //     .map(({ path, sha1 }) => ({
        //         path: join(StorageHelper.librariesDir, path),
        //         sha1,
        //     }));
        // this.#filesList.push(...libs);

        // TODO natives
        // const nativesDir = join(this.#clientDir, 'natives');

        // const nativesWithHash = await pMap(
        //     natives,
        //     async (native) => {
        //         const path = join(nativesDir, native);
        //         const sha1 = await HashHelper.getHashFromFile(path, 'sha1');
        //         return { path, sha1 };
        //     },
        //     { concurrency: 4 },
        // );

        //

        // const whitelistedFiles: WathedFile[] = [
        //     ...profile.updateVerify.map((path) => join(this.#clientDir, path)),
        // ];

        // const updateExclusions = profile.updateExclusions.map((file) =>
        //     join(this.#clientDir, file),
        // );

        this.#watcher = watch(this.#clientDir)
            .on('add', (path) => this.#addEventChecker(path))
            .on('change', (path) => this.#modifyEventChecker(path))
            .on('unlink', (path) => this.#removeEventChecker(path));
    }

    stop() {
        LogHelper.debug('[Watcher] Stopped');
        this.#needKill = false;
        this.#watcher?.close();
    }

    async #addEventChecker(path: string) {
        path = this.#normalizePath(path);
        LogHelper.debug('[Watcher] File added: ' + path);
        if (
            this.#includeOrContains(this.#verifyList, path) &&
            !this.#includeOrContains(this.#excludeList, path)
        ) {
            const hash = this.#filesList.find((file) =>
                path.includes(file.path),
            )?.sha1;

            if (
                !hash ||
                (await HashHelper.getHashFromFile(path, 'sha1')) !== hash
            ) {
                LogHelper.error(
                    '[Watcher] File tampering detected',
                    path.replace(this.#clientDir, ''),
                );
                this.#killProcess();
            }
        }
    }

    async #modifyEventChecker(path: string) {
        path = this.#normalizePath(path);
        LogHelper.debug('[Watcher] File modified: ' + path);
        if (
            this.#includeOrContains(this.#verifyList, path) &&
            !this.#includeOrContains(this.#excludeList, path)
        ) {
            const hash = this.#filesList.find((file) =>
                path.includes(file.path),
            )?.sha1;

            if (
                !hash ||
                (await HashHelper.getHashFromFile(path, 'sha1')) !== hash
            ) {
                LogHelper.error(
                    '[Watcher] File tampering detected',
                    path.replace(this.#clientDir, ''),
                );
                this.#killProcess();
            }
        }
    }

    #removeEventChecker(path: string) {
        path = this.#normalizePath(path);
        LogHelper.debug('[Watcher] File removed: ' + path);
        if (
            this.#includeOrContains(this.#verifyList, path) &&
            !this.#includeOrContains(this.#excludeList, path)
        ) {
            LogHelper.error(
                '[Watcher] File tampering detected',
                path.replace(this.#clientDir, ''),
            );
            this.#killProcess();
        }
    }

    #includeOrContains(list: string[], path: string): boolean {
        return (
            list.includes(path) || list.some((file) => path.startsWith(file))
        );
    }

    #killProcess() {
        LogHelper.debug('[Watcher] Process killed');
        if (this.#gameProcess) {
            this.#gameProcess.kill();
            this.stop();
        } else {
            this.#needKill = true;
        }
    }

    #normalizePath(path: string) {
        return path.replace(/\\/g, '/');
    }
}
