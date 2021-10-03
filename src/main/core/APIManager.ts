import { AuroraAPI, Response, ResponseError } from 'aurora-api';
import { api as apiConfig } from '@config';
import { App } from '..';

export default class APIManager {
    api = new AuroraAPI(apiConfig.ws || 'ws://localhost:1370');

    constructor() {
        this.api.onOpen = () => App.window.sendEvent('apiConnectSuccess');
        this.api.onError = (e) => {
            App.window.sendEvent('apiConnectError', 'Ошибка при подключении');
            console.error(e);
        };
    }

    public async send(
        type: string,
        data?: object
    ): Promise<Response | ResponseError> {
        return await this.api.send(type, data);
    }
}
