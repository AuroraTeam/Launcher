import { AuroraAPI } from '@aurora-launcher/api';
import { api as apiConfig } from '@config';
import { Service } from '@freshgum/typedi';

import { LogHelper } from '../helpers/LogHelper';

@Service([])
export class APIManager {
    private api = new AuroraAPI(apiConfig.ws || 'ws://localhost:1370', {
        onClose: () => setTimeout(() => this.initConnection(), 2000),
    });

    async initConnection() {
        try {
            await this.api.connect();
            this.#onConnectListeners.forEach((listener) => listener());
        } catch (error) {
            LogHelper.error(error);
        }
    }

    #onConnectListeners: (() => void)[] = [];
    onConnect(listener: () => void) {
        this.#onConnectListeners.push(listener);
    }

    public auth(login: string, password: string) {
        return this.api.auth(login, password);
    }

    public getServers() {
        return this.api.getServers();
    }

    public getProfile(uuid: string) {
        return this.api.getProfile(uuid);
    }

    public getUpdates(dir: string) {
        return this.api.getUpdates(dir);
    }

    public verify(stage: number, token?: string) {
        return this.api.verify(stage, token);
    }
}
