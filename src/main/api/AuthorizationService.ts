import { AuthType, AuthTypeResponseData } from '@aurora-launcher/core';
import { Service } from '@freshgum/typedi';

import { Session, UserData } from '../../common/types';
import { APIManager } from './APIManager';
import { IAuthProvider } from './providers/IAuthProvider';
import { InternalAuthProvider } from './providers/InternalAuthProvider';
import { MicrosoftAuthProvider } from './providers/MicrosoftAuthProvider';
import { OfflineAuthProvider } from './providers/OfflineAuthProvider';

@Service([APIManager])
export class AuthorizationService {
    private currentSession?: Session;
    private _provider?: IAuthProvider;

    get provider(): IAuthProvider | undefined {
        return this._provider;
    }

    constructor(private apiService: APIManager) {}

    async authorize(login: string, password: string): Promise<UserData> {
        const authType = await this.apiService.getAuthType();
        this._provider = this.createAuthProvider(this.apiService, authType);

        this.currentSession = await this._provider.login(login, password);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { accessToken, refreshToken, ...publicData } =
            this.currentSession;
        return publicData;
    }

    getCurrentSession() {
        return this.currentSession;
    }

    getGameArgs(): string[] {
        return [];
    }

    get useInjector() {
        return this.provider!.useInjector;
    }

    getInjectorEndpoint() {
        return this.provider!.injectorEndpoint;
    }

    private providersMap = {
        [AuthType.INTERNAL]: InternalAuthProvider,
        [AuthType.MICROSOFT]: MicrosoftAuthProvider,
        [AuthType.OFFLINE]: OfflineAuthProvider,
    };

    private createAuthProvider(
        apiService: APIManager,
        data: AuthTypeResponseData,
    ): IAuthProvider {
        return new this.providersMap[data.type](apiService, data.extra);
    }
}
