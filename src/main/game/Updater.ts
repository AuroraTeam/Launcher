import { existsSync, readdirSync } from "fs";
import { mkdir, mkdtemp, rename, rm, writeFile } from "fs/promises";
import { dirname, extname, join, resolve } from "path";

import {
    HashHelper,
    HashedFile,
    HttpHelper,
    JsonHelper,
    MojangAssets,
    Profile,
    ProfileLibrary,
} from "@aurora-launcher/core";
import { api as apiConfig } from "@config";
import { Service } from "@freshgum/typedi";
import pMap from "p-map";

import { LoadProgress } from "../../common/types";
import { StorageHelper } from "../../main/helpers/StorageHelper";
import { APIManager } from "../api/APIManager";
import { retry } from "../utils/retry";
import { GameWindow } from "./GameWindow";

@Service([APIManager, GameWindow])
export class Updater {
    constructor(
        private api: APIManager,
        private gameWindow: GameWindow,
    ) {}

    async validateClient(clientArgs: Profile, libraries: ProfileLibrary[]): Promise<HashedFile[]> {
        await this.validateAssets(clientArgs.assetIndex);
        await this.validateLibraries(libraries);
        return await this.validateGameFiles(clientArgs);
    }

    async validateAssets(assetIndex: string): Promise<void> {
        this.gameWindow.sendToConsole("Load assets files");

        const assetIndexPath = `indexes/${assetIndex}.json`;
        const filePath = join(StorageHelper.assetsDir, assetIndexPath);

        const assetIndexUrl = this.getFileUrl(assetIndexPath, "assets");
        const assetFile = await HttpHelper.getResource(assetIndexUrl);
        const { objects } = JsonHelper.parse<MojangAssets>(assetFile);
        if (
            !objects ||
            typeof objects !== "object" ||
            Array.isArray(objects) ||
            Object.values(objects).some(
                (entry) =>
                    !entry ||
                    !/^[a-f\d]{40}$/i.test(entry.hash) ||
                    !Number.isSafeInteger(entry.size) ||
                    entry.size < 0,
            )
        ) {
            throw new Error(`Invalid asset index: ${assetIndex}`);
        }

        await mkdir(dirname(filePath), { recursive: true });
        const temporaryDir = await mkdtemp(join(dirname(filePath), ".index-"));
        try {
            const temporaryFile = join(temporaryDir, "index.json");
            await writeFile(temporaryFile, assetFile);
            await rename(temporaryFile, filePath);
        } finally {
            await rm(temporaryDir, { recursive: true, force: true });
        }

        const assetsHashes = [
            ...new Map(Object.values(objects).map((entry) => [entry.hash, entry])).values(),
        ]
            .sort((a, b) => b.size - a.size)
            .map((hash) => ({
                ...hash,
                path: `objects/${hash.hash.slice(0, 2)}/${hash.hash}`,
            }));

        const total = assetsHashes.reduce((prev, cur) => prev + cur.size, 0);
        const updateProgress = this.createProgressUpdater(total, "size");

        try {
            await pMap(
                assetsHashes,
                async (hash) => {
                    await this.validateAndDownloadFile(
                        hash.path,
                        hash.hash,
                        StorageHelper.assetsDir,
                        "assets",
                    );

                    updateProgress(hash.size);
                },
                { concurrency: 4, stopOnError: false },
            );
        } catch (error) {
            throw new Error("Failed to update assets", { cause: error });
        }

        this.gameWindow.sendToConsole("Assets files loaded");
    }

    async validateLibraries(libraries: ProfileLibrary[]): Promise<void> {
        this.gameWindow.sendToConsole("Load libraries files");

        const updateProgress = this.createProgressUpdater(libraries.length, "count");

        await pMap(
            libraries,
            async (library) => {
                await this.validateAndDownloadFile(
                    library.path,
                    library.sha1,
                    StorageHelper.librariesDir,
                    "libraries",
                );

                updateProgress();
            },
            { concurrency: 4, stopOnError: false },
        );

        this.gameWindow.sendToConsole("Libraries files loaded");
    }

    async validateGameFiles(clientArgs: Profile): Promise<HashedFile[]> {
        this.gameWindow.sendToConsole("Load client files");

        const files = await this.api.getUpdates(clientArgs.clientDir);
        if (!Array.isArray(files)) throw new Error("Invalid client files response");

        const normalizePath = (path: string) => {
            const absolute = resolve(path.replace(/\\/g, "/"));
            return process.platform === "win32" ? absolute.toLowerCase() : absolute;
        };

        const gameJarPath = clientArgs.gameJar
            ? normalizePath(
                  join(StorageHelper.clientsDir, clientArgs.clientDir, clientArgs.gameJar),
              )
            : undefined;

        const isGameJar = (path: string) =>
            gameJarPath !== undefined &&
            normalizePath(join(StorageHelper.clientsDir, path)) === gameJarPath;

        if (gameJarPath && !files.some((file) => isGameJar(file.path))) {
            throw new Error(`Game JAR not found in client file manifest: ${clientArgs.gameJar}`);
        }

        const hashes = [...files].sort((a, b) => b.size - a.size);
        const total = hashes.reduce((prev, cur) => prev + cur.size, 0);
        const updateProgress = this.createProgressUpdater(total, "size");

        const verifyArray = clientArgs.update.concat(clientArgs.updateVerify);
        const verifyDirs = verifyArray.filter((path) => extname(path)[0] !== ".");
        const verifyFiles: string[] = [];

        await pMap(
            hashes,
            async (hash) => {
                const filteredPath = hash.path
                    .replace(/\\/g, "/")
                    .replace(`/${clientArgs.clientDir}/`, "");

                const verifyExisting = Boolean(
                    isGameJar(hash.path) ||
                    (verifyArray.find((u) => filteredPath.startsWith(u)) &&
                        !clientArgs.updateExclusions.find((u) => filteredPath.startsWith(u))),
                );
                if (verifyExisting) {
                    verifyFiles.push(filteredPath);
                }
                await this.validateAndDownloadFile(
                    hash.path,
                    hash.sha1,
                    StorageHelper.clientsDir,
                    "clients",
                    verifyExisting,
                );

                updateProgress(hash.size);
            },
            { concurrency: 4, stopOnError: false },
        );

        if (verifyDirs.length > 0) {
            for (const verifyDir of verifyDirs) {
                const verifyDirPath = join(
                    StorageHelper.clientsDir,
                    clientArgs.clientDir,
                    verifyDir,
                );

                const filesList = readdirSync(verifyDirPath, {
                    withFileTypes: true,
                    recursive: true,
                })
                    .filter((entry) => entry.isFile())
                    .map((entry) =>
                        join(entry.parentPath, entry.name)
                            .replace(verifyDirPath, "")
                            .replace(/\\/g, "/"),
                    );

                const whitelistedFiles = verifyFiles
                    .filter((x) => x.startsWith(verifyDir))
                    .map((x) => x.replace(verifyDir, "").replace(/\\/g, "/"));

                const excludeList = clientArgs.updateExclusions
                    .filter((x) => x.startsWith(verifyDir))
                    .map((x) => x.replace(verifyDir, "").replace(/\\/g, "/"));

                const fileRM = filesList.filter(
                    (path) =>
                        !whitelistedFiles.includes(path) &&
                        !excludeList.some((ex) => path.startsWith(ex)),
                );
                for (const file of fileRM) {
                    await rm(join(verifyDirPath, file));
                }
            }
        }
        this.gameWindow.sendToConsole("Client files loaded");
        return hashes;
    }

    private getFileUrl(path: string, type: "clients" | "libraries" | "assets"): URL {
        return new URL(join("files", type, path), apiConfig.web);
    }

    private async validateAndDownloadFile(
        path: string,
        sha1: string,
        rootDir: string,
        type: "clients" | "libraries" | "assets",
        verifyExisting = true,
    ): Promise<void> {
        const filePath = join(rootDir, path);
        const fileUrl = this.getFileUrl(path, type);

        if (!verifyExisting && existsSync(filePath)) return;

        try {
            if (await HashHelper.compareFileHash(filePath, "sha1", sha1.toLowerCase())) {
                return;
            }
        } catch {
            // ignore not found file
        }

        try {
            await retry(() => HttpHelper.downloadSafeFile(fileUrl, filePath, { sha1 }), 3, 1000);
        } catch (error) {
            throw new Error(`Failed to update ${path}`, { cause: error });
        }
    }

    private createProgressUpdater(total: number, type: LoadProgress["type"]) {
        let loaded = 0;

        return (size?: number) => {
            this.gameWindow.sendProgress({
                total,
                loaded: (loaded += size ?? 1),
                type,
            });
        };
    }
}
