import { join } from "path";

import { HashHelper, HashedFile, ProfileLibrary } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import { FSWatcher, watch } from "chokidar";

import { LogHelper } from "../../helpers/LogHelper";
import { StorageHelper } from "../../helpers/StorageHelper";
import { IProcess } from "./IProcess";
import { WatcherProfile } from "./WatcherProfile";

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
        LogHelper.debug("[Watcher] Game process set");
        this.#gameProcess = gameProcess;
        if (this.#needKill) {
            gameProcess.kill();
            this.stop();
        }
    }

    async start(
        profile: WatcherProfile,
        libraries: ProfileLibrary[],
        natives: { path: string; sha1: string }[],
        gameFiles: HashedFile[],
    ) {
        this.#clientDir = join(StorageHelper.clientsDir, profile.clientDir);
        this.#filesList = gameFiles.map(({ path, sha1 }) => ({
            path: this.#normalizePath(path),
            sha1,
        }));

        this.#verifyList = profile.updateVerify.map((path) =>
            this.#normalizePath(join(this.#clientDir, path)),
        );
        this.#excludeList = profile.updateExclusions.map((path) =>
            this.#normalizePath(join(this.#clientDir, path)),
        );

        const libs = libraries
            .filter((library) => library.type === "library")
            .map(({ path, sha1 }) => ({
                path: this.#normalizePath(join(StorageHelper.librariesDir, path)),
                sha1,
            }));
        this.#filesList.push(...libs);
        libs.forEach(({ path }) => this.#verifyList.push(path));

        const nativesDir = join(this.#clientDir, "natives");
        const formattedNatives = natives.map(({ path, sha1 }) => ({
            path: this.#normalizePath(join(nativesDir, path)),
            sha1,
        }));

        this.#filesList.push(...formattedNatives);
        formattedNatives.forEach(({ path }) => this.#verifyList.push(path));

        this.#watcher = watch(this.#verifyList)
            .on("add", (path) => this.#addEventChecker(this.#normalizePath(path)))
            .on("change", (path) => this.#modifyEventChecker(this.#normalizePath(path)))
            .on("unlink", (path) => this.#removeEventChecker(this.#normalizePath(path)));
    }

    stop() {
        LogHelper.debug("[Watcher] Stopped");
        this.#needKill = false;
        this.#watcher?.close();
    }

    async #addEventChecker(path: string) {
        LogHelper.debug("[Watcher] File added: " + path);
        if (
            this.#includeOrContains(this.#verifyList, path) &&
            !this.#includeOrContains(this.#excludeList, path)
        ) {
            const hash = this.#filesList.find((file) => path.includes(file.path))?.sha1;

            if (!hash || !(await HashHelper.compareFileHash(path, "sha1", hash))) {
                LogHelper.error(
                    "[Watcher] File tampering detected",
                    path.replace(this.#clientDir, ""),
                );
                this.#killProcess();
            }
        }
    }

    async #modifyEventChecker(path: string) {
        LogHelper.debug("[Watcher] File modified: " + path);
        if (
            this.#includeOrContains(this.#verifyList, path) &&
            !this.#includeOrContains(this.#excludeList, path)
        ) {
            const hash = this.#filesList.find((file) => path.includes(file.path))?.sha1;

            if (!hash || !(await HashHelper.compareFileHash(path, "sha1", hash))) {
                LogHelper.error(
                    "[Watcher] File tampering detected",
                    path.replace(this.#clientDir, ""),
                );
                this.#killProcess();
            }
        }
    }

    #removeEventChecker(path: string) {
        LogHelper.debug("[Watcher] File removed: " + path);
        if (
            this.#includeOrContains(this.#verifyList, path) &&
            !this.#includeOrContains(this.#excludeList, path)
        ) {
            LogHelper.error("[Watcher] File tampering detected", path.replace(this.#clientDir, ""));
            this.#killProcess();
        }
    }

    #includeOrContains(list: string[], path: string): boolean {
        return list.includes(path) || list.some((file) => path.startsWith(file));
    }

    #killProcess() {
        LogHelper.debug("[Watcher] Process killed");
        if (this.#gameProcess) {
            this.#gameProcess.kill();
            this.stop();
        } else {
            this.#needKill = true;
        }
    }

    #normalizePath(path: string) {
        return path.replace(/\\/g, "/");
    }
}
