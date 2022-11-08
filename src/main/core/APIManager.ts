import { api as apiConfig } from '@config';
import { AuroraAPI } from 'aurora-api';
import { ipcMain } from 'electron';

// TODO Подумать над реализацией корректной обработки запросов и отлова ошибок

export class APIManager {
    private api = new AuroraAPI(apiConfig.ws || 'ws://localhost:1370');
    private tryConnect = false;
    private failedСonnection = false;

    constructor() {
        this.api
            .connect()
            .catch(() => {
                this.failedСonnection = true;
            })
            .finally(() => {
                this.tryConnect = true;
            });

        this.initMethods();
    }

    private initMethods() {
        ipcMain.handle('auth', (_, login: string, password: string) =>
            this.errorHandler(() => this.api.auth(login, password))
        );
        ipcMain.handle('getStatus', () => this.getStatus());
        ipcMain.handle('getServers', () => this.api.getServers());
        ipcMain.handle('getProfile', (_, uuid: string) =>
            this.api.getProfile(uuid)
        );
    }

    public getStatus(): 'connected' | 'failure' | 'connecting' {
        if (this.tryConnect && this.failedСonnection) return 'failure';
        if (this.tryConnect) return 'connected';
        return 'connecting';
    }

    private async errorHandler(callback: () => any) {
        try {
            return await callback();
        } catch (error) {
            return error;
        }
    }
}
