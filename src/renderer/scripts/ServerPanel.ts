import { ipcRenderer } from 'electron'

export default class ServerPanel {
    static async getProfile(uuid: string) {
        return await ipcRenderer.invoke('getProfile', uuid)
    }
}