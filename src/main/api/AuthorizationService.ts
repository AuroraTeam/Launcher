import { AuthType } from '@aurora-launcher/core';
import { Service } from '@freshgum/typedi';

import { Session } from '../../common/types';
import { SettingsHelper } from '../helpers/SettingsHelper';
import { APIManager } from './APIManager';
import {
    IAuthProvider,
    InternalAuthProvider,
    MicrosoftAuthProvider,
    OfflineAuthProvider,
} from './authProviders';

@Service([APIManager])
export class AuthorizationService {
    private currentSession?: Session;
    private provider?: IAuthProvider;

    private providersMap = {
        [AuthType.INTERNAL]: InternalAuthProvider,
        [AuthType.MICROSOFT]: MicrosoftAuthProvider,
        [AuthType.OFFLINE]: OfflineAuthProvider,
    };

    constructor(private apiService: APIManager) {}

    get session() {
        return this.currentSession;
    }

    get useInjector() {
        return this.provider?.useInjector;
    }

    get injectorEndpoint() {
        return this.provider?.injectorEndpoint;
    }

    private createAuthProvider(type: AuthType): IAuthProvider {
        return new this.providersMap[type]();
    }

    async initializeSession() {
        try {
            const info = await this.apiService.getLauncherInfo();
            this.provider = this.createAuthProvider(info.settings.authType);
        } catch {
            this.provider = this.createAuthProvider(AuthType.OFFLINE);
        }

        const accessToken = SettingsHelper.getField('accessToken');
        const clientToken = SettingsHelper.getField('clientToken');

        // const authData = publicDecrypt(
        //     api.publicKey,
        //     Buffer.from(SettingsHelper.getField('token'), 'hex'),
        // ).toString('utf-8');

        let isValid;
        try {
            isValid = await this.provider.verify(accessToken, clientToken);
        } catch {
            throw new Error('Failed to verify tokens');
        }

        if (isValid) {
            return this.setCurrentSession({
                username: SettingsHelper.getField('username'),
                userUUID: SettingsHelper.getField('userUUID'),
                accessToken,
                clientToken,
            });
        }

        let refresh;
        try {
            refresh = await this.provider.refresh(accessToken, clientToken);
        } catch {
            throw new Error('Failed to refresh tokens');
        }

        this.setCurrentSession({
            username: refresh.selectedProfile.name,
            userUUID: refresh.selectedProfile.id,
            accessToken: refresh.accessToken,
            clientToken: refresh.clientToken,
        });
    }

    async authorize(login: string, password: string) {
        if (!this.provider) throw new Error('No auth provider');

        let userData;
        try {
            userData = await this.provider.auth(login, password);
        } catch {
            throw new Error('Failed to authorize user');
        }

        this.setCurrentSession({
            username: userData.selectedProfile.name,
            userUUID: userData.selectedProfile.id,
            accessToken: userData.accessToken,
            clientToken: userData.clientToken,
        });

        return this.currentSession;
    }

    private setCurrentSession(session: Session) {
        this.currentSession = session;
        SettingsHelper.setField('username', session.username);
        SettingsHelper.setField('userUUID', session.userUUID);
        SettingsHelper.setField('accessToken', session.accessToken);
        SettingsHelper.setField('clientToken', session.clientToken);
    }
}
