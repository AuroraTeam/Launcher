import { beforeEach, expect, it, vi } from 'vitest';

import { GameService } from './GameService';

vi.mock('@freshgum/typedi', () => ({
    Service: () => (target: unknown) => target,
}));
vi.mock('../api/APIManager', () => ({ APIManager: class {} }));
vi.mock('./GameWindow', () => ({ GameWindow: class {} }));
vi.mock('./Starter', () => ({ Starter: class {} }));
vi.mock('./Updater', () => ({ Updater: class {} }));
vi.mock('./Watcher', () => ({ Watcher: class {} }));
vi.mock('./LibrariesMatcher', () => ({
    LibrariesMatcher: { match: () => true },
}));

beforeEach(() => vi.clearAllMocks());

it.each(['prestart', 'start'] as const)(
    'stops the game state and watcher when %s fails',
    async (phase) => {
        const failure = new Error('Native extraction failed');
        const api = {
            getProfile: vi.fn().mockResolvedValue({ libraries: [] }),
        };
        const updater = { validateClient: vi.fn().mockResolvedValue([]) };
        const watcher = {
            start: vi.fn(),
            stop: vi.fn(),
            setGameProcess: vi.fn(),
        };
        const starter = {
            prestart: vi.fn().mockResolvedValue({ nativesFiles: [] }),
            start: vi.fn(),
        };
        starter[phase].mockRejectedValue(failure);
        const gameWindow = { sendToConsole: vi.fn(), stopGame: vi.fn() };
        const dependencies = [
            api,
            updater,
            watcher,
            starter,
            gameWindow,
        ] as unknown as ConstructorParameters<typeof GameService>;
        const game = new GameService(...dependencies);
        await game.setServer({ profileUUID: 'profile' } as Parameters<
            GameService['setServer']
        >[0]);
        await expect(game.startGame()).rejects.toBe(failure);
        if (phase === 'prestart') {
            expect(watcher.start).not.toHaveBeenCalled();
            expect(starter.start).not.toHaveBeenCalled();
        } else {
            expect(watcher.start).toHaveBeenCalledOnce();
            expect(watcher.setGameProcess).not.toHaveBeenCalled();
        }
        expect(watcher.stop).toHaveBeenCalledOnce();
        expect(gameWindow.stopGame).toHaveBeenCalledOnce();
    },
);
