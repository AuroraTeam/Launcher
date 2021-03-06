import { Response } from "aurora-api"
import { ipcMain, IpcMainInvokeEvent } from "electron"
import { App } from "../.."

export default class ServerList {
    constructor() {
        ipcMain.handle('getServers', this.getServers)
    }

    async getServers(_e: IpcMainInvokeEvent) {
        try {
            const { data } = await App.api?.api?.send('servers') as Response & { data: { servers: any[] } }
            return data.servers
        } catch (error) {
            return {
                code: error.code,
                message: error.message
            }
        }
    }
}
