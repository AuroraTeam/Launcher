import { IAuthProvider } from './IAuthProvider';

export class OfflineAuthProvider implements IAuthProvider {
    readonly useInjector = false;

    async login(login: string, password: string): Promise<void> {
        throw new Error('Not implemented');
    }

    async verify(accessToken: string): Promise<void> {
        throw new Error('Not implemented');
    }

    async refresh(): Promise<void> {
        throw new Error('Not implemented');
    }

    async logout(): Promise<void> {
        throw new Error('Not implemented');
    }
}
