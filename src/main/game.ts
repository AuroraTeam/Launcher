import { ipcMain } from "electron"
import { IpcMainEvent } from "electron/main"

import {getGameArgs, scanDir } from './func'
import * as path from 'path'
import { spawn } from 'child_process'
import { App } from "."

export default class Game {
    constructor() {
        ipcMain.on('startGame', this.start)
    }

    async start(e: IpcMainEvent) {

        const version = '1.16.4';
        const client_dir = 'client1.16.4-fabric';
        const assets_dir = 'assets1.16.4';

        const gameProfile = {
            version_name: version,
            game_directory: path.resolve(__dirname, client_dir),
            assets_root: path.resolve(__dirname, assets_dir),
            assets_index_name: version,
        };

        const gameArgs = getGameArgs(gameProfile);

        const natives_directory = path.resolve(__dirname, client_dir, 'natives');
        const libraries_directory = path.resolve(__dirname, client_dir, 'libraries');

        let classpath = scanDir(libraries_directory);
        classpath.push(path.resolve(__dirname, client_dir, 'minecraft.jar'));
        // classpath.push(path.resolve(__dirname, client_dir, 'forge.jar'));
        // classpath = classpath.join(';');

        const jvmArgs = [
            // "-Dfml.ignorePatchDiscrepancies=true",
            // "-Dfml.ignoreInvalidMinecraftCertificates=true",
            "-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump",
            "-Dos.name=Windows 10",
            "-Dos.version=10.0",
            `-Djava.library.path=${natives_directory}`,
            // "-Dminecraft.launcher.brand=${launcher_name}",
            // "-Dminecraft.launcher.version=${launcher_version}",
            "-cp",
            `${classpath.join(';')}`,
            // 'net.minecraft.client.main.Main',
            'net.fabricmc.loader.launch.knot.KnotClient',
            // 'net.minecraft.launchwrapper.Launch',
            // "--tweakClass", "net.minecraftforge.fml.common.launcher.FMLTweaker",
            // "--versionType", "Forge"
            ...gameArgs
        ]

        const l = spawn('java', jvmArgs)

        l.stdout.on('data', (data: Buffer) => {
            App.window?.mainWindow?.webContents.send('textToConsole', data.toString())
            console.log(data.toString())
        })
        
        l.stderr.on('data', (data: Buffer) => {
            App.window?.mainWindow?.webContents.send('textToConsole', data.toString())
            console.error(data.toString())
        })
        
        l.on('close', () => {
            e.reply('stopGame')
            console.log('game stop')
        });

    }
}
