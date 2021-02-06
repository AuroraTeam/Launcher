import { Response } from "aurora-api"
import { ipcMain, IpcMainInvokeEvent } from "electron"
import { App } from "../.."

export default class ServerList {
    constructor() {
        ipcMain.handle('getProfiles', this.getProfiles)
    }

    async getProfiles(_e: IpcMainInvokeEvent) {
        try {
            const { data } = await App.api?.api?.send('profiles') as Response
            return data
        } catch (error) {
            return {
                code: error.code,
                message: error.message
            }
        }
    }
}
