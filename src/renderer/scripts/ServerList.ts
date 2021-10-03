export default class ServerList {
    static async getServers(): Promise<any> {
        return await window.launcherAPI.ipc.invoke('getServers');
    }
}
