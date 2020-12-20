import { ipcRenderer } from 'electron'

export default class ServerList {
    static async getProfiles() {
        return await ipcRenderer.invoke('getProfiles')
    }
}