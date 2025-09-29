import { HttpHelper } from '@aurora-launcher/core';
import { api } from '@config';

import { IAuthProvider } from './IAuthProvider';

export class InternalAuthProvider implements IAuthProvider {
    readonly useInjector = true;
    readonly injectorEndpoint = api.web;

    async auth(username: string, password: string, clientToken?: string) {
        try {
            return await HttpHelper.postJson<{
                accessToken: string;
                clientToken: string;
                selectedProfile: {
                    id: string;
                    name: string;
                };
            }>(
                new URL(
                    '/authlib/authserver/authenticate',
                    this.injectorEndpoint,
                ),
                { username, password, clientToken },
            );
        } catch (error) {
            this.rethrowError(error);
        }
    }

    refresh(accessToken: string, clientToken?: string) {
        return HttpHelper.postJson<{
            accessToken: string;
            clientToken: string;
            selectedProfile: {
                id: string;
                name: string;
            };
        }>(new URL('/authlib/authserver/refresh', this.injectorEndpoint), {
            accessToken,
            clientToken,
        });
    }

    verify(accessToken: string, clientToken?: string) {
        return HttpHelper.postJson<boolean>(
            new URL('/authlib/authserver/validate', this.injectorEndpoint),
            { accessToken, clientToken },
        );
    }

    logout(accessToken: string, clientToken?: string) {
        return HttpHelper.postJson<void>(
            new URL('/authlib/authserver/invalidate', this.injectorEndpoint),
            { accessToken, clientToken },
        );
    }

    private rethrowError(error: any): never {
        throw new Error(
            (error as any).body.message || (error as Error).message,
        );
    }
}
