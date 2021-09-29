export default class ServerList {
    static async getServers(): Promise<any> {
        return await window.ipcRenderer.invoke('getServers');
    }
}
