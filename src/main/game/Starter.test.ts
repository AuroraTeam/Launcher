import { EventEmitter } from 'events';
import { join } from 'path';

import { Profile, ProfileLibrary } from '@aurora-launcher/core';
import { beforeEach, expect, it, vi } from 'vitest';

import { Starter } from './Starter';

const fixtures = vi.hoisted(() => ({
    unzip: vi.fn(),
    match: vi.fn(),
    spawn: vi.fn(),
    storage: {
        librariesDir: '/libraries',
        clientsDir: '/clients',
        assetsDir: '/assets',
    },
}));
vi.mock('@freshgum/typedi', () => ({
    Service: () => (target: unknown) => target,
}));
vi.mock('@aurora-launcher/core', () => ({
    ZipHelper: { unzip: fixtures.unzip },
}));
vi.mock('child_process', () => ({ spawn: fixtures.spawn }));
vi.mock('electron', () => ({ app: { getVersion: () => 'test' } }));
vi.mock('../helpers/StorageHelper', () => ({
    StorageHelper: fixtures.storage,
}));
vi.mock('../helpers/SettingsHelper', () => ({
    SettingsHelper: {
        getAllFields: () => ({
            clients: [],
            fullScreen: false,
            autoConnect: false,
        }),
    },
}));
vi.mock('../helpers/LogHelper', () => ({
    LogHelper: { info() {}, error() {} },
}));
vi.mock('../helpers/PlatformHelper', () => ({
    PlatformHelper: { isMac: false },
}));
vi.mock('./LibrariesMatcher', () => ({
    LibrariesMatcher: { match: fixtures.match },
}));
vi.mock('../core/LauncherWindow', () => ({ LauncherWindow: class {} }));
vi.mock('../api/AuthorizationService', () => ({
    AuthorizationService: class {},
}));
vi.mock('./GameWindow', () => ({ GameWindow: class {} }));
vi.mock('./JavaManager', () => ({ JavaManager: class {} }));
vi.mock('./AuthlibInjector', () => ({ AuthlibInjector: class {} }));

const native = (path: string): ProfileLibrary => ({
    path,
    sha1: 'sha1',
    type: 'native',
});
const profile = (libraries: ProfileLibrary[] = []) =>
    ({
        clientDir: 'test',
        javaVersion: 17,
        version: '1.20.1',
        libraries,
        jvmArgs: [],
        clientArgs: [],
        gameJar: 'minecraft.jar',
        mainClass: 'Main',
    }) as unknown as Profile;

function makeStarter(useInjector = false) {
    const window = { hideWindow: vi.fn(), showWindow: vi.fn() };
    const gameWindow = { sendToConsole: vi.fn(), stopGame: vi.fn() };
    const java = {
        checkAndDownloadJava: vi.fn().mockResolvedValue(undefined),
        getJavaPath: vi.fn().mockResolvedValue('/java'),
    };
    const authlib = {
        verify: vi.fn().mockResolvedValue(undefined),
        authlibFilePath: '/authlib.jar',
    };
    const authorization = {
        useInjector,
        injectorEndpoint: 'https://example.test',
        session: { username: 'test', userUUID: 'uuid', accessToken: 'token' },
    };
    const dependencies = [
        window,
        authorization,
        gameWindow,
        java,
        authlib,
    ] as unknown as ConstructorParameters<typeof Starter>;
    return { starter: new Starter(...dependencies), window, java, authlib };
}

beforeEach(() => {
    vi.clearAllMocks();
    fixtures.unzip.mockReset().mockResolvedValue([]);
    fixtures.match.mockReset().mockReturnValue(true);
    fixtures.spawn.mockReset();
});

it('prestart waits for every native archive and preserves extraction order', async () => {
    let finish!: () => void;
    const gate = new Promise<void>((resolve) => {
        finish = resolve;
    });
    fixtures.unzip.mockImplementationOnce(async () => {
        await gate;
        return [{ path: 'first.dll', sha1: 'first' }];
    });
    fixtures.unzip.mockResolvedValueOnce([
        { path: 'second.dll', sha1: 'second' },
    ]);
    const { starter, java } = makeStarter();
    let finished = false;
    const result = starter
        .prestart(profile([native('first.jar'), native('second.jar')]))
        .then((value) => {
            finished = true;
            return value;
        });
    await vi.waitFor(() => expect(fixtures.unzip).toHaveBeenCalledTimes(1));
    expect(finished).toBe(false);
    expect(java.checkAndDownloadJava).toHaveBeenCalled();
    finish();
    expect((await result).nativesFiles).toEqual([
        { path: 'first.dll', sha1: 'first' },
        { path: 'second.dll', sha1: 'second' },
    ]);
    expect(fixtures.unzip).toHaveBeenNthCalledWith(
        2,
        join('/libraries', 'second.jar'),
        join('/clients', 'test', 'natives'),
        ['.so', '.dylib', '.jnilib', '.dll'],
    );
});

it('propagates unpacking errors and does not start further extractions', async () => {
    fixtures.unzip.mockRejectedValueOnce(new Error('broken ZIP'));
    await expect(
        makeStarter().starter.prestart(
            profile([native('broken.jar'), native('second.jar')]),
        ),
    ).rejects.toThrow('Failed to unpack native library: broken.jar');
    expect(fixtures.unzip).toHaveBeenCalledTimes(1);
    expect(fixtures.spawn).not.toHaveBeenCalled();
});

it('returns the final hash when native archives overwrite the same file', async () => {
    fixtures.unzip.mockResolvedValueOnce([{ path: 'shared.dll', sha1: 'old' }]);
    fixtures.unzip.mockResolvedValueOnce([
        { path: 'shared.dll', sha1: 'final' },
    ]);
    const files = await makeStarter().starter.prepareNatives('/natives', [
        native('one.jar'),
        native('two.jar'),
    ]);
    expect(files).toEqual([{ path: 'shared.dll', sha1: 'final' }]);
});

it('extracts only native libraries matching the current platform', async () => {
    fixtures.match.mockReturnValueOnce(false).mockReturnValueOnce(true);
    const { starter } = makeStarter();
    await starter.prepareNatives('/natives', [
        { path: 'ordinary.jar', sha1: '', type: 'library' },
        native('wrong-os.jar'),
        native('current-os.jar'),
    ]);
    expect(fixtures.unzip).toHaveBeenCalledTimes(1);
    expect(fixtures.unzip).toHaveBeenCalledWith(
        join('/libraries', 'current-os.jar'),
        '/natives',
        expect.any(Array),
    );
});

it('does not spawn the game when injector verification fails', async () => {
    const { starter, authlib } = makeStarter(true);
    await starter.prestart(profile());
    authlib.verify.mockRejectedValue(new Error('checksum mismatch'));
    const startArgs = [
        profile(),
        [],
        {},
        { stop: vi.fn() },
    ] as unknown as Parameters<Starter['start']>;
    await expect(starter.start(...startArgs)).rejects.toThrow(
        'checksum mismatch',
    );
    expect(fixtures.spawn).not.toHaveBeenCalled();
});

it('turns a spawn error into a rejected launch instead of an unhandled process error', async () => {
    const child = Object.assign(new EventEmitter(), {
        stdout: new EventEmitter(),
        stderr: new EventEmitter(),
    });
    const failure = new Error('ENOENT');
    fixtures.spawn.mockImplementation(() => {
        queueMicrotask(() => child.emit('error', failure));
        return child;
    });
    const { starter, window } = makeStarter();
    await starter.prestart(profile());
    const startArgs = [
        profile(),
        [],
        {},
        { stop: vi.fn() },
    ] as unknown as Parameters<Starter['start']>;
    await expect(starter.start(...startArgs)).rejects.toBe(failure);
    expect(window.hideWindow).not.toHaveBeenCalled();
});
