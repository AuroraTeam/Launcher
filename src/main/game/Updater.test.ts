import { HashedFile, Profile } from '@aurora-launcher/core';
import { beforeEach, expect, expectTypeOf, it, vi } from 'vitest';

import { APIManager } from '../api/APIManager';
import { Updater } from './Updater';

const fixtures = vi.hoisted(() => ({ download: vi.fn(), compare: vi.fn() }));
vi.mock('@freshgum/typedi', () => ({
    Service: () => (target: unknown) => target,
}));
vi.mock('@aurora-launcher/core', () => ({
    HashHelper: { compareFileHash: fixtures.compare },
    HttpHelper: { downloadSafeFile: fixtures.download },
}));
vi.mock('fs', () => ({ existsSync: () => true }));
vi.mock('../api/APIManager', () => ({ APIManager: class {} }));
vi.mock('./GameWindow', () => ({ GameWindow: class {} }));
vi.mock('../helpers/StorageHelper', () => ({
    StorageHelper: { clientsDir: '/clients' },
}));

const profile = {
    clientDir: 'test',
    update: [],
    updateVerify: [],
    updateExclusions: [],
} as unknown as Profile;
function makeUpdater() {
    const api = { getUpdates: vi.fn() };
    const window = { sendToConsole: vi.fn(), sendProgress: vi.fn() };
    const updater = new Updater(
        ...([api, window] as unknown as ConstructorParameters<typeof Updater>),
    );
    return { updater, api, window };
}
beforeEach(() => vi.clearAllMocks());

it('exposes a typed file list from the API', () => {
    expectTypeOf<ReturnType<APIManager['getUpdates']>>().toEqualTypeOf<
        Promise<HashedFile[]>
    >();
});

it('propagates a missing client error before reporting a successful update', async () => {
    const { updater, api, window } = makeUpdater();
    api.getUpdates.mockRejectedValue(new Error('Client not found'));
    await expect(updater.validateGameFiles(profile)).rejects.toThrow(
        'Client not found',
    );
    expect(fixtures.download).not.toHaveBeenCalled();
    expect(window.sendToConsole).not.toHaveBeenCalledWith(
        'Client files loaded',
    );
});

it('accepts an empty client but rejects a malformed response', async () => {
    const { updater, api } = makeUpdater();
    api.getUpdates
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce({ error: 'missing' });
    await expect(updater.validateGameFiles(profile)).resolves.toEqual([]);
    await expect(updater.validateGameFiles(profile)).rejects.toThrow(
        'Invalid client files response',
    );
});

it('orders files by size without modifying the API response and totals progress', async () => {
    const { updater, api, window } = makeUpdater();
    const small = { path: '/test/small', size: 10, sha1: 'one' };
    const large = { path: '/test/large', size: 20, sha1: 'two' };
    api.getUpdates.mockResolvedValue(Object.freeze([small, large]));
    await expect(updater.validateGameFiles(profile)).resolves.toEqual([
        large,
        small,
    ]);
    expect(window.sendProgress).toHaveBeenLastCalledWith({
        total: 30,
        loaded: 30,
        type: 'size',
    });
});
