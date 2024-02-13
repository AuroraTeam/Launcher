import { Service } from 'typedi';

import { Session, UserData } from '../../common/types';
import { APIManager } from './APIManager';

@Service()
export class AuthorizationService {
    private currentSession?: Session;

    constructor(private apiService: APIManager) {}

    async authorize(login: string, password: string): Promise<UserData> {
        this.currentSession = await this.apiService.auth(login, password);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { accessToken, ...publicData } = this.currentSession;
        return publicData;
    }

    getCurrentSession() {
        return this.currentSession;
    }
}
