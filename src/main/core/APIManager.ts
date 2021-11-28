import { AuroraAPI, Response, ResponseError } from 'aurora-api';
import { api as apiConfig } from '@config';
import { ipcMain } from 'electron';

export default class APIManager {
    public readonly api = new AuroraAPI(apiConfig.ws || 'ws://localhost:1370');
    private tryConnect = false;

    constructor() {
        this.api.onOpen = () => (this.tryConnect = true);
        this.api.onError = () => (this.tryConnect = true);

        ipcMain.handle('auth', (_, login: string, password: string) =>
            this.auth(login, password)
        );
        ipcMain.handle('getStatus', () => this.getStatus());
        ipcMain.handle('getServers', () => this.getServers());
        ipcMain.handle('getProfile', (_, uuid: string) =>
            this.getProfile(uuid)
        );
    }

    public getStatus(): 'connected' | 'failure' | 'connecting' {
        if (this.api.hasConnected()) return 'connected';
        if (this.tryConnect) return 'failure';
        return 'connecting';
    }

    public async send(
        type: string,
        data?: object
    ): Promise<Response | ResponseError> {
        await this.api.ready();
        return await this.api.send(type, data);
    }

    async auth(login: string, password: string): Promise<object> {
        try {
            const { data } = <Response>(
                await this.send('auth', { login, password })
            );
            return data;
        } catch (error) {
            const e = <ResponseError>error; // Какого хрена TS?!
            console.log(`Ошибка №${e.code}: ${e.message}`);
            return {
                error: e.message,
            };
        }
    }

    async getServers(): Promise<any[] | object> {
        try {
            const { data } = <ServerResponse>await this.send('servers');
            return data.servers;
        } catch (error) {
            const e = <ResponseError>error; // Какого хрена TS?!
            return {
                code: e.code,
                message: e.message,
            };
        }
    }

    async getProfile(uuid: string): Promise<any[] | object> {
        try {
            const { data } = <ProfileResponse>(
                await this.send('profile', { uuid })
            );
            return data.profile;
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

interface ProfileResponse extends Response {
    data: { profile: any[] };
}
