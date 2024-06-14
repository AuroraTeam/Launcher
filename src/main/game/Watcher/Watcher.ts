import { join } from 'path';

import { ProfileLibrary } from '@aurora-launcher/core';
import { watch } from 'chokidar';
import { Service } from '@freshgum/typedi';

import { LogHelper } from '../../helpers/LogHelper';
import { StorageHelper } from '../../helpers/StorageHelper';
import { IProcess } from './IProcess';
import { WatcherProfile } from './WatcherProfile';

@Service([])
export class Watcher {
    async watch(
        profile: WatcherProfile,
        libraries: ProfileLibrary[],
        natives: string[],
        gameProcess: IProcess,
    ) {
        const libs = libraries
            .filter((library) => library.type === 'library')
            .map(({ path }) => join(StorageHelper.librariesDir, path));

        const clientDir = join(StorageHelper.clientsDir, profile.clientDir);
        const nativesDir = join(clientDir, 'natives');

        natives = natives.map((native) => join(nativesDir, native));

        const whitelistedFiles = [
            ...libs,
            ...natives,
            ...profile.updateVerify.map((path) => join(clientDir, path)),
        ];

        const updateExclusions = profile.updateExclusions.map((file) =>
            join(clientDir, file),
        );

        watch(whitelistedFiles)
            .on('add', (path) =>
                this.addEventChecker(
                    path,
                    whitelistedFiles,
                    updateExclusions,
                    gameProcess,
                ),
            )
            .on('change', (path) =>
                this.modifyEventChecker(
                    path,
                    whitelistedFiles,
                    updateExclusions,
                    gameProcess,
                ),
            )
            .on('unlink', (path) =>
                this.removeEventChecker(
                    path,
                    whitelistedFiles,
                    updateExclusions,
                    gameProcess,
                ),
            );
    }

    addEventChecker(
        path: string,
        whitelistedFiles: string[],
        updateExclusions: string[],
        gameProcess: IProcess,
    ) {
        // LogHelper.debug('[Watcher] File added: ' + path);
        // if (
        //     whitelistedFiles.includes(path) //||
        //     // (whitelistedFiles.some((file) => path.startsWith(file)))
        // ) {
        //     // ok
        // } else {
        //     LogHelper.error('[Watcher] File tampering detected');
        //     gameProcess.kill();
        //     return 'killed';
        // }
    }

    modifyEventChecker(
        path: string,
        whitelistedFiles: string[],
        updateExclusions: string[],
        gameProcess: IProcess,
    ) {
        // LogHelper.debug('[Watcher] File modified: ' + path);
        // if (whitelistedFiles.includes(path)) {
        //     LogHelper.error('[Watcher] File tampering detected');
        //     gameProcess.kill();
        // }
    }

    removeEventChecker(
        path: string,
        whitelistedFiles: string[],
        updateExclusions: string[],
        gameProcess: IProcess,
    ) {
        // LogHelper.debug('[Watcher] File removed: ' + path);
        // if (whitelistedFiles.includes(path)) {
        //     LogHelper.error('[Watcher] File tampering detected');
        //     gameProcess.kill();
        // }
    }
}
