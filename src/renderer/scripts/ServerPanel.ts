export default class ServerPanel {
    static async getProfile(uuid: string): Promise<any> {
        return await window.launcherAPI.ipc.invoke('getProfile', uuid);
    }
}
