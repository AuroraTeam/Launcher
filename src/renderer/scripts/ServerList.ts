import { ipcRenderer } from 'electron'

export default class ServerList {
    static async getServers() {
        return await ipcRenderer.invoke('getServers')
    }
}