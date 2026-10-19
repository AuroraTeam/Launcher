import { totalmem } from 'os';

import { MIN_MEMORY_MB, MemoryLimits } from '../../common/memory';

export function getMemoryLimits(): MemoryLimits {
    const totalMB = totalmem() / 1024 ** 2;
    const reserveMB = Math.max(2048, totalMB * 0.25);
    const maximum = Math.max(
        MIN_MEMORY_MB,
        Math.round((totalMB - reserveMB) / 1024) * 1024,
    );
    const recommended = Math.min(
        maximum,
        Math.max(MIN_MEMORY_MB, Math.round(totalMB / 2048) * 1024),
    );
    return { recommended, maximum };
}
