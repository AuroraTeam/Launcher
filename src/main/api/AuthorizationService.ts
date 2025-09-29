import { AuthType } from '@aurora-launcher/core';
import { Service } from '@freshgum/typedi';

import { Session } from '../../common/types';
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

    constructor(private apiService: APIManager) {
        this.apiService.getLauncherInfo().then((info) => {
            this.provider = this.createAuthProvider(info.settings.authType);
        });
    }

    async authorize(login: string, password: string) {
        if (!this.provider) throw new Error('No auth provider');

        const userData = await this.provider.auth(login, password);

        this.currentSession = {
            username: userData.selectedProfile.name,
            userUUID: userData.selectedProfile.id,
            accessToken: userData.accessToken,
        };

        return this.currentSession;
    }

    getCurrentSession() {
        return this.currentSession;
    }

    getGameArgs(): string[] {
        return [];
    }

    get useInjector() {
        return this.provider?.useInjector;
    }

    getInjectorEndpoint() {
        return this.provider?.injectorEndpoint;
    }

    private providersMap = {
        [AuthType.INTERNAL]: InternalAuthProvider,
        [AuthType.MICROSOFT]: MicrosoftAuthProvider,
        [AuthType.OFFLINE]: OfflineAuthProvider,
    };

    private createAuthProvider(type: AuthType): IAuthProvider {
        return new this.providersMap[type]();
    }
}
