import { totalmem } from 'os';

import { expect, it, vi } from 'vitest';

import { getMemoryLimits } from './MemoryHelper';

vi.mock('os', () => ({ totalmem: vi.fn() }));

it.each([
    [4 * 1024 ** 3, 2048, 2048],
    [8 * 1024 ** 3, 4096, 6144],
    [16 * 1024 ** 3, 8192, 12288],
    [34278473728, 16384, 24576],
    [64 * 1024 ** 3, 32768, 49152],
    [2 * 1024 ** 3, 1024, 1024],
])(
    'calculates memory limits from OS-reported RAM (%s bytes)',
    (bytes, recommended, maximum) => {
        vi.mocked(totalmem).mockReturnValue(bytes);
        expect(getMemoryLimits()).toEqual({ recommended, maximum });
    },
);
