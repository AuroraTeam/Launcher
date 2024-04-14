import { join } from 'path';

import { Profile, ProfileLibrary } from '@aurora-launcher/core';
import { watch } from 'chokidar';
import { Service } from 'typedi';

import { LogHelper } from '../helpers/LogHelper';
import { StorageHelper } from '../helpers/StorageHelper';

@Service()
export class Watcher {
    async watch(
        profile: Profile,
        libraries: ProfileLibrary[],
        natives: string[],
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
            ...profile.updateVerify.map((file) => join(clientDir, file)),
        ];

        watch(whitelistedFiles)
            .on('add', (path) =>
                this.addEventChecker(
                    path,
                    whitelistedFiles,
                    profile.updateExclusions,
                ),
            )
            .on('change', (path) =>
                this.removeEventChecker(
                    path,
                    whitelistedFiles,
                    profile.updateExclusions,
                ),
            )
            .on('unlink', (path) =>
                this.modifyEventChecker(
                    path,
                    whitelistedFiles,
                    profile.updateExclusions,
                ),
            );
    }

    private addEventChecker(
        path: string,
        whitelistedFiles: string[],
        updateExclusions: string[],
    ) {
        LogHelper.info(`Watcher: ${path} added`);
    }

    private removeEventChecker(
        path: string,
        whitelistedFiles: string[],
        updateExclusions: string[],
    ) {
        LogHelper.info(`Watcher: ${path} removed`);
    }

    private modifyEventChecker(
        path: string,
        whitelistedFiles: string[],
        updateExclusions: string[],
    ) {
        LogHelper.info(`Watcher: ${path} modified`);
    }
}
