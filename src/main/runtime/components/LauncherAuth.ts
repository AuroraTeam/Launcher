import { Response, ResponseError } from 'aurora-api';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { App } from '../..';

export default class LauncherAuth {
    constructor() {
        ipcMain.handle('auth', this.auth);
    }

    async auth(_e: IpcMainInvokeEvent, login: string, password: string) {
        try {
            const { data } = <Response>(
                await App.api.send('auth', { login, password })
            );
            return data;
        } catch (error) {
            const e = <ResponseError>error; // Какого хрена TS?!
            console.log(`Ошибка №${e.code}: ${e.message}`);
            return {
                error: e.message
            };
        }
    }
}
