import { randomUUID } from 'crypto';

import { api } from '@config';
import { v5 } from 'uuid';

import { IAuthProvider } from './IAuthProvider';

export class OfflineAuthProvider implements IAuthProvider {
    readonly useInjector = false;

    private userData!: {
        accessToken: string;
        clientToken: string;
        selectedProfile: {
            id: string;
            name: string;
        };
    };

    async auth(login: string) {
        this.userData = {
            accessToken: randomUUID(),
            clientToken: randomUUID(),
            selectedProfile: {
                id: v5(
                    `OfflinePlayer:${login}`,
                    v5(api.publicKey, '00000000-0000-0000-0000-000000000000'),
                ),
                name: login,
            },
        };
        return this.userData;
    }

    async verify() {
        return true;
    }

    async refresh() {
        return this.userData;
    }

    async logout() {
        return;
    }
}
