import { AuthResponseData } from '@aurora-launcher/core';

export type UserData = Omit<Session, 'accessToken'>;

export type Session = AuthResponseData;

export interface LoadProgress {
    total: number;
    loaded: number;
    type: 'count' | 'size';
}
