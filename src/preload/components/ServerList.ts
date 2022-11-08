import { ipcRenderer } from 'electron';

export default class ServerList {
    static getServers(): Promise<any[]> {
        return ipcRenderer.invoke('getServers');
    }
}
