import { ipcRenderer } from 'electron';

export default class ServerPanel {
    static getProfile(uuid: string): Promise<any> {
        return ipcRenderer.invoke('getProfile', uuid);
    }
}
