import { expect, it } from 'vitest';

import { getClientMemory, setClientMemory } from './memory';

it('uses the same bounded default for each new client', () => {
    expect(getClientMemory([], 'one', 8192)).toBe(2048);
    expect(getClientMemory([], 'one', 1024)).toBe(1024);
});

it('preserves a saved allocation above the recommendation up to the maximum', () => {
    const recommended = 8192;
    const maximum = 12288;
    const saved = [{ clientId: 'one', memory: 10240 }];
    expect(saved[0].memory).toBeGreaterThan(recommended);
    expect(getClientMemory(saved, 'one', maximum)).toBe(10240);
});

it('updates only the chosen profile and retains other profile settings', () => {
    const clients = [
        { clientId: 'one', memory: 4096 },
        { clientId: 'two', memory: 2048 },
    ];
    const updated = setClientMemory(clients, 'two', 3072);
    expect(getClientMemory(updated, 'one', 8192)).toBe(4096);
    expect(getClientMemory(updated, 'two', 8192)).toBe(3072);
    expect(clients[1].memory).toBe(2048);
    expect(setClientMemory(updated, 'three', 1024)).toHaveLength(3);
});

it('normalizes invalid saved memory and caps it to the current machine', () => {
    for (const memory of [NaN, Infinity, -1, 0]) {
        expect(
            getClientMemory([{ clientId: 'one', memory }], 'one', 8192),
        ).toBe(2048);
    }
    expect(
        getClientMemory([{ clientId: 'one', memory: 16384 }], 'one', 4096),
    ).toBe(4096);
    expect(
        getClientMemory([{ clientId: 'one', memory: 3000 }], 'one', 8192),
    ).toBe(2816);
});
