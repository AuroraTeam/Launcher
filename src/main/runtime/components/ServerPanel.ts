import { Response } from "aurora-api"
import { ipcMain, IpcMainInvokeEvent } from "electron"
import { App } from "../.."

export default class ServerPanel {
    constructor() {
        ipcMain.handle('getProfile', this.getProfile)
    }

    async getProfile(_e: IpcMainInvokeEvent, uuid: string) {
        try {
            const { data } = await App.api?.api?.send('profile', {uuid}) as Response & { data: { profile: any[] } }
            return data.profile
        } catch (error) {
            return {
                code: error.code,
                message: error.message
            }
        }
    }
}
