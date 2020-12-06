import { Response, ResponseError } from "aurora-api"
import { ipcMain } from "electron"
import { IpcMainInvokeEvent } from "electron/main"
import { App } from "."

export default class LauncherAuth {
    constructor() {
        ipcMain.handle('auth', this.auth)
    }

    async auth(_e: IpcMainInvokeEvent, login: string, password: string) {
        const auth = await App.api?.send('auth', {
            login,
            password
        })

        if ((auth as ResponseError).code !== undefined) {
            return {
                code: (auth as ResponseError).code,
                message: (auth as ResponseError).message
            }
            // ipcMain.emit('authResult', {
            //     code: (auth as ResponseError).code,
            //     message: (auth as ResponseError).message
            // })
        } else {
            // ipcMain.emit('authResult', {
            //     status: true,
            //     login: (auth as AuthResponse).data.login
            // })
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