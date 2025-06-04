import { AuthTypeResponseData } from '@aurora-launcher/core';

import { APIManager } from '../APIManager';
import { IAuthProvider } from './IAuthProvider';

export class InternalAuthProvider implements IAuthProvider {
    readonly useInjector = true;
    readonly injectorEndpoint: string;

    constructor(
        private apiManager: APIManager,
        extra: AuthTypeResponseData['extra'],
    ) {
        this.injectorEndpoint = (<{ endpoint: string }>extra).endpoint;
    }

    login(login: string, password: string) {
        return this.apiManager.auth(login, password);
    }

    verify(accessToken: string) {
        throw Error('Not implemented');
    }

    refresh(accessToken: string) {
        throw Error('Not implemented');
    }

    logout(accessToken: string) {
        throw Error('Not implemented');
    }
}
