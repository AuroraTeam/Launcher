import { ipcMain, IpcMainEvent } from "electron"

import * as path from 'path'
import * as fs from 'fs'
import { spawn } from 'child_process'
import { App } from ".."

interface ClientArgs {
    clientVersion: string
    clientDir: string
    assetsDir: string
    username: string
    userUUID: string
    accessToken: string
    clientClassPath: string[]
    jvmArgs: string[]
    clientArgs: string[]
    mainClass: string
}

export default class Starter {
    constructor() {
        ipcMain.on('startGame', this.start)
    }

    async start(event: IpcMainEvent, clientArgs: ClientArgs) {
        const gameArgs = [
            "--username",
            `${clientArgs.username}`,
            "--version",
            `${clientArgs.clientVersion}`,
            "--gameDir",
            `${path.resolve(__dirname, clientArgs.clientDir)}`,
            "--assetsDir",
            `${path.resolve(__dirname, clientArgs.assetsDir)}`,
            "--assetIndex",
            `${clientArgs.clientVersion}`,
            "--uuid",
            `${clientArgs.userUUID}`,
            "--accessToken",
            `${clientArgs.accessToken}`,
            "--userType",
            'mojang',
            "--versionType",
            // `${version_type}`,
            'AuroraLauncher v0.1.0',
        ]

        const librariesDirectory = path.resolve(__dirname, clientArgs.clientDir, 'libraries');
        const nativesDirectory = path.resolve(__dirname, clientArgs.clientDir, 'natives');

        const classpath = Starter.scanDir(librariesDirectory);
        classpath.push(path.resolve(__dirname, clientArgs.clientDir, 'minecraft.jar'));
        if (clientArgs.clientClassPath !== undefined) {
            clientArgs.clientClassPath.forEach((fileName) => {
                classpath.push(path.resolve(__dirname, clientArgs.clientDir, fileName));
            })
        }

        const jvmArgs = [
            `-Djava.library.path=${nativesDirectory}`,
            ...clientArgs.jvmArgs || [],
            "-cp",
            `${classpath.join(';')}`,
            clientArgs.mainClass,
            ...clientArgs.clientArgs || [],
            ...gameArgs
        ]

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
}
