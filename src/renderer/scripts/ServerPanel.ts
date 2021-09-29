export default class ServerPanel {
    static async getProfile(uuid: string): Promise<any> {
        return await window.ipcRenderer.invoke('getProfile', uuid);
    }
}
