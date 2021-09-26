import { Response, ResponseError } from 'aurora-api';
import { ipcMain } from 'electron';
import { App } from '../..';

export default class ServerList {
    constructor() {
        ipcMain.handle('getServers', this.getServers);
    }

    async getServers(): Promise<any[] | object> {
        try {
            const { data } = <ServerResponse>await App.api.send('servers');
            return data.servers;
        } catch (error) {
            const e = <ResponseError>error; // Какого хрена TS?!
            return {
                code: e.code,
                message: e.message,
            };
        }
    }
}

interface ServerResponse extends Response {
    data: { servers: any[] };
}
