import { SettingsFormat } from './types';

export const MEMORY_STEP_MB = 256;
export const MIN_MEMORY_MB = 1024;

export interface MemoryLimits {
    recommended: number;
    maximum: number;
}

export function getClientMemory(
    clients: SettingsFormat['clients'],
    clientId: string,
    limit: number,
): number {
    const saved = clients.find(
        (client) => client.clientId === clientId,
    )?.memory;
    const memory =
        saved !== undefined && Number.isFinite(saved) && saved > 0
            ? saved
            : MIN_MEMORY_MB;
    return Math.min(
        limit,
        Math.max(
            MIN_MEMORY_MB,
            Math.floor(memory / MEMORY_STEP_MB) * MEMORY_STEP_MB,
        ),
    );
}

export function setClientMemory(
    clients: SettingsFormat['clients'],
    clientId: string,
    memory: number,
): SettingsFormat['clients'] {
    return [
        ...clients.filter((client) => client.clientId !== clientId),
        { clientId, memory },
    ];
}
