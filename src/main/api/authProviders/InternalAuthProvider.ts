import { HttpHelper, JsonHelper } from '@aurora-launcher/core';
import { api } from '@config';

import { LogHelper } from '../../helpers/LogHelper';
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

    async verify(accessToken: string, clientToken?: string) {
        try {
            await HttpHelper.post(
                new URL('/authlib/authserver/validate', this.injectorEndpoint),
                JsonHelper.stringify({ accessToken, clientToken }),
                { 'Content-Type': 'application/json' },
            );
            return true;
        } catch (error) {
            LogHelper.error('Failed to verify access token', error);
            return false;
        }
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
