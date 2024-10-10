import { publicDecrypt } from 'crypto';

import { JsonHelper } from '@aurora-launcher/core';
import { api } from '@config';
import { Service } from '@freshgum/typedi';
import { ipcMain } from 'electron';

import { EVENTS } from '../../common/channels';
import { AuthorizationService } from '../api/AuthorizationService';
import { IHandleable } from '../core/IHandleable';
import { SettingsHelper } from '../helpers/SettingsHelper';

@Service([AuthorizationService])
export class LoginScene implements IHandleable {
    constructor(private authorizationService: AuthorizationService) {}

    initHandlers() {
        ipcMain.handle(
            EVENTS.SCENES.LOGIN.AUTH,
            (_, login: string, password: string) =>
                this.authorizationService.authorize(login, password),
        );

        ipcMain.handle(EVENTS.SCENES.LOGIN.AUTH_TOKEN, () => {
            const authData = publicDecrypt(
                api.publicKey,
                Buffer.from(SettingsHelper.getField('token'), 'hex'),
            ).toString('utf-8');
            const jsonAuthData: TokenData = JsonHelper.fromJson(authData);
            return this.authorizationService.authorize(
                jsonAuthData.login,
                jsonAuthData.password,
            );
        });
    }
}

interface TokenData {
    login: string;
    password: string;
}
