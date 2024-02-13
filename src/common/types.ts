// TODO!!! Синхронизировать типы
export interface UserData {
    username: string;
    userUUID: string;
    isAlex?: boolean;
    skinUrl?: string;
    capeUrl?: string;
}

export interface Session extends UserData {
    accessToken: string;
}

export interface LoadProgress {
    total: number;
    loaded: number;
    type: 'count' | 'size';
}
