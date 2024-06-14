import { publicDecrypt, publicEncrypt } from 'crypto';

import { api as apiConfig } from '@config';
import { Service } from '@freshgum/typedi';

import { LogHelper } from '../helpers/LogHelper';
import { APIManager } from './APIManager';

@Service([APIManager])
export class VerifyService {
    constructor(private apiService: APIManager) {}

    init() {
        this.verify();
        this.apiService.onConnect(() => this.verify());
    }

    async verify() {
        const { token } = await this.apiService.verify(1);
        if (!token) {
            LogHelper.fatal('Verify token not send');
        }

        const { publicKey } = apiConfig;
        if (!publicKey) {
            LogHelper.fatal('Verify public key required');
        }

        const decryptedToken = publicDecrypt(
            publicKey,
            Buffer.from(token, 'hex'),
        );

        await this.apiService.verify(
            2,
            publicEncrypt(publicKey, decryptedToken).toString('hex'),
        );

        LogHelper.info('Verify success');
    }
}
