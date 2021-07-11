import { ipcMain, IpcMainEvent } from "electron"

import * as path from "path"
import * as fs from "fs"
import { spawn } from "child_process"
import { App } from ".."
import { gte } from "semver"
import { Request } from "aurora-api"
import { StorageHelper } from "../helpers/StorageHelper"
import { HttpHelper } from "../helpers/HttpHelper"
import pMap from "p-map"
import { LogHelper } from "main/helpers/LogHelper"
const api = require("@config").api

interface ClientArgs {
    // Auth params
    username: string
    userUUID: string
    accessToken: string

    // Client
    version: string
    clientDir: string

    // Assets
    assetsIndex: string
    assetsDir: string

    // Launch client
    mainClass: string
    classPath: string[]
    jvmArgs: string[]
    clientArgs: string[]
}

// TODO БООООООЛЬШЕ РЕФАКТОРА, КОД ПОГРЯЗ В ГОВНЕ!!!

export default class Starter {
    constructor() {
        ipcMain.on("startGame", (event, clientArgs) =>
            this.startChain(event, clientArgs)
        )
    }

    async startChain(event: IpcMainEvent, clientArgs: ClientArgs) {
        await this.hash(event, clientArgs)
        await this.start(event, clientArgs)
    }

    async start(event: IpcMainEvent, clientArgs: ClientArgs) {
        const clientDir = path.join(__dirname, "clients", clientArgs.clientDir)
        const assetsDir = path.join(__dirname, "assets", clientArgs.assetsDir)

        const gameArgs: string[] = []

        if (gte(clientArgs.version, "1.6.0")) {
            this.gameLauncher(gameArgs, clientArgs, clientDir, assetsDir)
        } else {
            this.gameLauncherLegacy(gameArgs, clientArgs, clientDir, assetsDir)
        }

        const librariesDirectory = path.resolve(clientDir, 'libraries')
        const nativesDirectory = path.resolve(clientDir, 'natives')

        const classpath = Starter.scanDir(librariesDirectory)
        classpath.push(path.resolve(clientDir, 'minecraft.jar'))
        // if (clientArgs.classPath !== undefined) {
        //     clientArgs.classPath.forEach((fileName) => {
        //         classpath.push(path.resolve(clientDir, fileName))
        //     })
        // }

        const jvmArgs = []

        jvmArgs.push(`-Djava.library.path=${nativesDirectory}`)

        if (clientArgs.jvmArgs?.length > 0) {
            jvmArgs.push(...clientArgs.jvmArgs)
        }

        jvmArgs.push("-cp", classpath.join(path.delimiter))
        jvmArgs.push(clientArgs.mainClass)

        jvmArgs.push(...gameArgs)
        if (clientArgs.clientArgs?.length > 0) {
            jvmArgs.push(...clientArgs.clientArgs)
        }

        const gameProccess = spawn("java", jvmArgs, {
            cwd: clientDir
        })

        gameProccess.stdout.on("data", (data: Buffer) => {
            App.window.sendEvent("textToConsole", data.toString())
            console.log(data.toString())
        })

        gameProccess.stderr.on("data", (data: Buffer) => {
            App.window.sendEvent("textToConsole", data.toString())
            console.error(data.toString())
        })

        gameProccess.on("close", () => {
            event.reply("stopGame")
            console.log("game stop")
        })
    }

    async download(dir: string, type: "assets" | "client") {
        const hashes = await App.api.send("updates", { dir })
        let parentDir =
            type == "assets"
                ? StorageHelper.assetsDir
                : StorageHelper.clientsDir
        App.window.sendEvent("textToConsole", `Load ${type} files \n`)

        const fileHashes = ((hashes as Request).data as {
            hashes: any[]
        }).hashes.sort((a, b) => b.size - a.size)
        const totalSize = fileHashes.reduce((p, c) => p + c.size, 0)
        let loaded = 0

        await pMap(
            fileHashes,
            async hash => {
                const filePath = path.join(parentDir, hash.path)
                fs.mkdirSync(path.dirname(filePath), { recursive: true })
                await HttpHelper.downloadFile(
                    new URL(hash.path.replace("\\", "/"), api.fileUrl),
                    filePath
                )
                App.window.sendEvent(
                    "textToConsole",
                    `File ${hash.path} downloaded \n`
                )
                App.window.sendEvent("loadProgress", {
                    total: totalSize,
                    loaded: loaded += hash.size
                })
            },
            { concurrency: 4 }
        )
    }

    async hash(_event: IpcMainEvent, clientArgs: ClientArgs) {
        if (
            !fs.existsSync(
                path.resolve(StorageHelper.assetsDir, clientArgs.assetsDir)
            )
        ) {
            await this.download(clientArgs.assetsDir, "assets")
        } else {
            // Здесь должен быть код, который будет проверять хеш файлов
        }

        if (
            !fs.existsSync(
                path.resolve(StorageHelper.clientsDir, clientArgs.clientDir)
            )
        ) {
            await this.download(clientArgs.clientDir, "client")
        } else {
            // И здесь тоже
        }
        return // Проверка хешей файлов, подобую хрень ещё нужно в дирвотчер кинуть
    }

    static scanDir(dir: string, list: string[] = []): string[] {
        if (fs.statSync(dir).isDirectory()) {
            for (const fdir of fs.readdirSync(dir)) {
                this.scanDir(path.resolve(dir, fdir), list)
            }
        } else {
            list.push(dir)
        }
        return list
    }

    gameLauncher(
        gameArgs: string[],
        clientArgs: ClientArgs,
        clientDir: string,
        assetsDir: string
    ) {
        gameArgs.push("--username", clientArgs.username)
        gameArgs.push("--version", clientArgs.version)
        gameArgs.push("--gameDir", clientDir)
        gameArgs.push("--assetsDir", assetsDir)

        if (gte(clientArgs.version, "1.7.2")) {
            gameArgs.push("--uuid", clientArgs.userUUID)
            gameArgs.push("--accessToken", clientArgs.accessToken)

            if (gte(clientArgs.version, "1.7.3")) {
                gameArgs.push("--assetIndex", clientArgs.assetsIndex)
            }

            if (gte(clientArgs.version, "1.7.4")) {
                gameArgs.push("--userType", "mojang")
            }

            if (gte(clientArgs.version, "1.9.0")) {
                gameArgs.push("--versionType", "AuroraLauncher v0.1.0")
            }
        } else {
            gameArgs.push("--session", clientArgs.accessToken)
        }
    }

    gameLauncherLegacy(
        gameArgs: string[],
        clientArgs: ClientArgs,
        clientDir: string,
        assetsDir: string
    ) {
        gameArgs.push(clientArgs.username)
        gameArgs.push(clientArgs.accessToken)
        gameArgs.push("--version", clientArgs.version)
        gameArgs.push("--gameDir", clientDir)
        gameArgs.push("--assetsDir", assetsDir)
    }
}
