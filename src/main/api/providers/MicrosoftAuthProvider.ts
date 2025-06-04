import { IAuthProvider } from './IAuthProvider';

export class MicrosoftAuthProvider implements IAuthProvider {
    readonly useInjector = true;

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
