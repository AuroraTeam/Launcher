export interface Session {
    username: string;
    userUUID: string;
    accessToken: string;
}

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
