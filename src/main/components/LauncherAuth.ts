import { Response, ResponseError } from "aurora-api"
import { ipcMain, IpcMainInvokeEvent } from "electron"
import { App } from ".."

export default class LauncherAuth {
    constructor() {
        ipcMain.handle('auth', this.auth)
    }

    async auth(_e: IpcMainInvokeEvent, login: string, password: string) {
        const auth = await App.api?.api?.send('auth', {login, password})

        if ((auth as ResponseError).code !== undefined) {
            return {
                status: false,
                code: (auth as ResponseError).code,
                message: (auth as ResponseError).message
            }
        } else {
            return {
                status: true,
                login: (auth as AuthResponse).data.login
            }
        }
    }
}

interface AuthResponse extends Response {
    data: {
        login: string
    }
}