import { AuroraAPI } from '@aurora-launcher/api';
import { api as apiConfig } from '@config';
import { Service } from '@freshgum/typedi';

import { LogHelper } from '../helpers/LogHelper';

/**
 * API Manager
 *
 * Отвечает за подключение к API, если первое подключение не удалось - попытки прекращаются и лаунчер уходит в Offline режим
 *
 * Если API подключается - лаунчер использует данное подключение и переподключается при разрыве соединения
 */
@Service([])
export class APIManager {
    private isConnected = false;
    private reconnectTimeout?: NodeJS.Timeout;

    private api = new AuroraAPI(apiConfig.ws || 'ws://localhost:1370', {
        onClose: () => {
            if (this.isConnected) {
                this.reconnectTimeout = setTimeout(
                    () => this.initConnection(),
                    5000,
                );
            }
        },
    });

    async initConnection() {
        clearTimeout(this.reconnectTimeout);

        try {
            await this.api.connect();
            this.isConnected = true;
            this.#onConnectListeners.forEach((listener) => listener());
        } catch (error) {
            LogHelper.error(error);
        }
    }

    #onConnectListeners: (() => void)[] = [];
    onConnect(listener: () => void) {
        this.#onConnectListeners.push(listener);
    }

    public getAuthType() {
        return this.api.getAuthType();
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
