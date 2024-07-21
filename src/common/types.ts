import { AuthResponseData } from '@aurora-launcher/core';

export type UserData = Omit<Session, 'accessToken'>;

export type Session = AuthResponseData;

export interface LoadProgress {
    total: number;
    loaded: number;
    type: 'count' | 'size';
}

export interface SettingsFormat {
    token?: string;
    dir?: string;
    autoConnect?: boolean;
    fullScreen?: boolean;
    memory?: number;
    startDebug?: boolean;
}