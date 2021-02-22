import { ipcMain, IpcMainEvent } from "electron"

import * as path from 'path'
import * as fs from 'fs'
import { spawn } from 'child_process'
import { App } from ".."
import { gte } from "semver"

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

// TODO Ещё больше рефактора

export default class Starter {
    constructor() {
        ipcMain.on('startGame', (event, clientArgs) => this.startChain(event, clientArgs))
    }

    async startChain(event: IpcMainEvent, clientArgs: ClientArgs) {
        await this.download(event, clientArgs)
        await this.hash(event, clientArgs)
        await this.start(event, clientArgs)
    }

    async start(event: IpcMainEvent, clientArgs: ClientArgs) {
        const clientDir = path.resolve(__dirname, 'clients', clientArgs.clientDir)
        const assetsDir = path.resolve(__dirname, 'assets', clientArgs.assetsDir)

        const gameArgs: string[] = []

        if (gte(clientArgs.version, '1.6.0')) {
            this.gameLauncher(gameArgs, clientArgs, clientDir, assetsDir)
        } else {
            this.gameLauncherLegacy(gameArgs, clientArgs, clientDir, assetsDir)
        }

        const librariesDirectory = path.resolve(clientDir, 'libraries')
        const nativesDirectory = path.resolve(clientDir, 'natives')

        const classpath = Starter.scanDir(librariesDirectory)
        classpath.push(path.resolve(clientDir, 'minecraft.jar'))
        if (clientArgs.classPath !== undefined) {
            clientArgs.classPath.forEach((fileName) => {
                classpath.push(path.resolve(clientDir, fileName))
            })
        }

        const jvmArgs = []

        jvmArgs.push(`-Djava.library.path=${nativesDirectory}`)

        if (clientArgs.jvmArgs?.length > 0) {
            jvmArgs.push(...clientArgs.jvmArgs)
        }

        jvmArgs.push("-cp", classpath.join(path.delimiter))
        jvmArgs.push(clientArgs.mainClass)

        if (clientArgs.clientArgs?.length > 0) {
            jvmArgs.push(...clientArgs.clientArgs)
        }
        jvmArgs.push(...gameArgs)

        const gameProccess = spawn('java', jvmArgs)

        gameProccess.stdout.on('data', (data: Buffer) => {
            App.window?.mainWindow?.webContents.send('textToConsole', data.toString())
            console.log(data.toString())
        })
        
        gameProccess.stderr.on('data', (data: Buffer) => {
            App.window?.mainWindow?.webContents.send('textToConsole', data.toString())
            console.error(data.toString())
        })
        
        gameProccess.on('close', () => {
            event.reply('stopGame')
            console.log('game stop')
        });
    }

    download(event: IpcMainEvent, clientArgs: ClientArgs) {
        return
    }

    hash(event: IpcMainEvent, clientArgs: ClientArgs) {
        return
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

    gameLauncher(gameArgs: string[], clientArgs: ClientArgs, clientDir: string, assetsDir: string) {
        gameArgs.push('--username', clientArgs.username)
        gameArgs.push('--version', clientArgs.version)
        gameArgs.push("--gameDir", clientDir)
        gameArgs.push("--assetsDir", assetsDir)

        if (gte(clientArgs.version, '1.7.2')) {
            gameArgs.push("--uuid", clientArgs.userUUID)
            gameArgs.push("--accessToken", clientArgs.accessToken)

            if (gte(clientArgs.version, '1.7.3')) {
                gameArgs.push("--assetIndex", clientArgs.assetsIndex)
            }

            if (gte(clientArgs.version, '1.7.4')) {
                gameArgs.push("--userType", "mojang")
            }

            if (gte(clientArgs.version, '1.9.0')) {
                gameArgs.push("--versionType", "AuroraLauncher v0.1.0")
            }
        } else {
            gameArgs.push("--session", clientArgs.accessToken)
        }
    }

    gameLauncherLegacy(gameArgs: string[], clientArgs: ClientArgs, clientDir: string, assetsDir: string) {
        gameArgs.push(clientArgs.username)
        gameArgs.push(clientArgs.accessToken)
        gameArgs.push("--version", clientArgs.version)
        gameArgs.push("--gameDir", clientDir)
        gameArgs.push("--assetsDir", assetsDir)
    }
}
