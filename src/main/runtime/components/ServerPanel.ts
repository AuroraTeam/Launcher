import { Response, ResponseError } from 'aurora-api';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { App } from '../..';

export default class ServerPanel {
    constructor() {
        ipcMain.handle('getProfile', this.getProfile);
    }

    async getProfile(
        _e: IpcMainInvokeEvent,
        uuid: string
    ): Promise<any[] | object> {
        try {
            const { data } = <ProfileResponse>(
                await App.api.send('profile', { uuid })
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

interface ProfileResponse extends Response {
    data: { profile: any[] };
}
