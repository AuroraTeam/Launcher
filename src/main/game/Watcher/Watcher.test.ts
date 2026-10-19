import { EventEmitter } from 'events';
import { join } from 'path';

import { beforeEach, expect, it, vi } from 'vitest';

import { Watcher } from './Watcher';

const fixtures = vi.hoisted(() => ({ watch: vi.fn(), compare: vi.fn() }));
vi.mock('@freshgum/typedi', () => ({
    Service: () => (target: unknown) => target,
}));
vi.mock('@aurora-launcher/core', () => ({
    HashHelper: { compareFileHash: fixtures.compare },
}));
vi.mock('chokidar', () => ({ watch: fixtures.watch }));
vi.mock('../../helpers/LogHelper', () => ({
    LogHelper: { debug() {}, error() {} },
}));
vi.mock('../../helpers/StorageHelper', () => ({
    StorageHelper: { clientsDir: '/clients', librariesDir: '/libraries' },
}));

let events: EventEmitter & { close: ReturnType<typeof vi.fn> };
const profile = { clientDir: 'test', updateVerify: [], updateExclusions: [] };

beforeEach(() => {
    vi.clearAllMocks();
    events = Object.assign(new EventEmitter(), {
        close: vi.fn().mockResolvedValue(undefined),
    });
    fixtures.watch.mockReturnValue(events);
    fixtures.compare.mockReset().mockResolvedValue(true);
});

it('uses the prepared native hash without stopping a valid game', async () => {
    const watcher = new Watcher();
    const game = { kill: vi.fn() };
    await watcher.start(
        profile,
        [],
        [{ path: 'native.dll', sha1: 'expected' }],
        [],
    );
    watcher.setGameProcess(game);
    events.emit('add', join('/clients', 'test', 'natives', 'native.dll'));
    await vi.waitFor(() => expect(fixtures.compare).toHaveBeenCalledOnce());
    expect(fixtures.compare.mock.calls[0]?.slice(1)).toEqual([
        'sha1',
        'expected',
    ]);
    expect(game.kill).not.toHaveBeenCalled();
    watcher.stop();
});

it('stops the process and watcher if an extracted native changes', async () => {
    fixtures.compare.mockResolvedValue(false);
    const watcher = new Watcher();
    const game = { kill: vi.fn() };
    await watcher.start(
        profile,
        [],
        [{ path: 'native.dll', sha1: 'expected' }],
        [],
    );
    watcher.setGameProcess(game);
    events.emit('change', join('/clients', 'test', 'natives', 'native.dll'));
    await vi.waitFor(() => expect(game.kill).toHaveBeenCalledOnce());
    expect(events.close).toHaveBeenCalledOnce();
});
