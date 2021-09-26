import { AuroraAPI } from 'aurora-api';
import { ConfigHelper } from 'main/helpers/ConfigHelper';
import { App } from '..';

export default class APIManager {
    api = new AuroraAPI(
        ConfigHelper.getConfig().api.ws || 'ws://localhost:1370'
    );

    constructor() {
        this.api.onOpen = () => App.window.sendEvent('apiConnectSuccess');
        this.api.onError = e => {
            App.window.sendEvent('apiConnectError', 'Ошибка при подключении');
            console.error(e);
        };
    }

    public async send(type: string, data?: object) {
        return await this.api.send(type, data);
    }
}
