import { Response } from "aurora-api"
import { ipcMain, IpcMainInvokeEvent } from "electron"
import { App } from "../.."

export default class LauncherAuth {
    constructor() {
        ipcMain.handle('auth', this.auth)
    }

    async auth(_e: IpcMainInvokeEvent, login: string, password: string) {
        try {
            const { data } = await App.api?.api?.send('auth', {login, password}) as AuthResponse
            return data
        } catch (error) {
            console.log(`Ошибка №${error.code}: ${error.message}`)
            return {
                error: error.message
            }
        }
    }
}

interface AuthResponse extends Response {
    data: {
        login: string
    }
}