import { ipcMain } from 'electron';
import { Service } from '@freshgum/typedi';

import { EVENTS } from '../../common/channels';
import { AuthorizationService } from '../api/AuthorizationService';
import { IHandleable } from '../core/IHandleable';

@Service([AuthorizationService])
export class LoginScene implements IHandleable {
    constructor(private authorizationService: AuthorizationService) {}

    initHandlers() {
        ipcMain.handle(
            EVENTS.SCENES.LOGIN.AUTH,
            (_, login: string, password: string) =>
                this.authorizationService.authorize(login, password),
        );
    }
}
