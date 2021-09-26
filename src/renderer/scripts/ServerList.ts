import { ipcRenderer } from 'electron';

export default class ServerList {
    static async getServers(): Promise<any> {
        return await ipcRenderer.invoke('getServers');
    }
}
