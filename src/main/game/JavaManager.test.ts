import { execFile } from 'child_process';
import { createHash } from 'crypto';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

import { HttpHelper, ZipHelper } from '@aurora-launcher/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PlatformHelper } from '../helpers/PlatformHelper';
import { JavaManager } from './JavaManager';

const fixtures = vi.hoisted(() => ({
    storage: { javaDir: '' },
    platform: { isWindows: true, isLinux: false, isMac: false },
    execFile: vi.fn(),
    chmod: vi.fn(),
    download: vi.fn(),
    metadata: vi.fn(),
    unzip: vi.fn(),
}));
vi.mock('@freshgum/typedi', () => ({
    Service: () => (target: unknown) => target,
}));
vi.mock('../helpers/StorageHelper', () => ({
    StorageHelper: fixtures.storage,
}));
vi.mock('../helpers/PlatformHelper', () => ({
    PlatformHelper: fixtures.platform,
}));
vi.mock('child_process', () => ({ execFile: fixtures.execFile }));
vi.mock('fs/promises', async (original) => ({
    ...(await original<typeof import('fs/promises')>()),
    chmod: fixtures.chmod,
}));
vi.mock('@aurora-launcher/core', async (original) => ({
    ...(await original<typeof import('@aurora-launcher/core')>()),
    HttpHelper: {
        getResourceFromJson: fixtures.metadata,
        downloadFile: fixtures.download,
    },
    ZipHelper: { unzip: fixtures.unzip },
}));

let root: string;
const archive = Buffer.from('downloaded Java archive');
const md5 = createHash('md5').update(archive).digest('hex');
const gameWindow = { sendToConsole: vi.fn(), sendProgress: vi.fn() };
const windowArg = () =>
    gameWindow as unknown as Parameters<JavaManager['checkAndDownloadJava']>[1];

async function unpack(
    destination: string,
    executable = 'zulu/bin/java.exe',
    corrupt = false,
) {
    const filePath = join(destination, executable);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, 'runtime executable');
    return [
        {
            path: executable,
            sha1: corrupt
                ? 'bad'
                : createHash('sha1').update('runtime executable').digest('hex'),
        },
    ];
}

beforeEach(async () => {
    vi.clearAllMocks();
    root = await mkdtemp(join(process.cwd(), '.java-test-'));
    fixtures.storage.javaDir = join(root, 'java');
    Object.assign(fixtures.platform, {
        isWindows: true,
        isLinux: false,
        isMac: false,
    });
    fixtures.execFile
        .mockReset()
        .mockImplementation((_file, _args, _options, callback) =>
            callback(null, '', 'openjdk version "17.0.12"'),
        );
    fixtures.chmod.mockResolvedValue(undefined);
    fixtures.metadata
        .mockReset()
        .mockImplementation(async (url: string | URL) =>
            String(url).includes('/packages/?')
                ? [
                      {
                          package_uuid: 'test-package',
                          download_url: 'https://example.test/java.zip',
                      },
                  ]
                : { md5_hash: md5 },
        );
    fixtures.download
        .mockReset()
        .mockImplementation(async (_url, destination: string) => {
            await writeFile(destination, archive);
            return destination;
        });
    fixtures.unzip
        .mockReset()
        .mockImplementation(async (_file, destination: string) =>
            unpack(destination),
        );
});
afterEach(async () => {
    await rm(root, { recursive: true, force: true });
});

it('reuses a runnable matching Java offline and resolves java.exe on Windows', async () => {
    await unpack(join(fixtures.storage.javaDir, '17'));
    const manager = new JavaManager();
    await manager.checkAndDownloadJava(17, windowArg());
    expect(HttpHelper.getResourceFromJson).not.toHaveBeenCalled();
    expect(execFile).toHaveBeenCalledWith(
        expect.stringContaining('java.exe'),
        ['-version'],
        expect.objectContaining({ timeout: 15000, windowsHide: true }),
        expect.any(Function),
    );
    expect(await manager.getJavaPath(17)).toBe(
        join(fixtures.storage.javaDir, '17/zulu/bin/java.exe'),
    );
});

it('repairs a partial directory without removing another Java version', async () => {
    await mkdir(join(fixtures.storage.javaDir, '17'), { recursive: true });
    await mkdir(join(fixtures.storage.javaDir, '8'));
    await writeFile(join(fixtures.storage.javaDir, '8/keep'), 'other runtime');
    await new JavaManager().checkAndDownloadJava(17, windowArg());
    expect(
        await readFile(
            join(fixtures.storage.javaDir, '17/zulu/bin/java.exe'),
            'utf8',
        ),
    ).toBe('runtime executable');
    expect(
        await readFile(join(fixtures.storage.javaDir, '8/keep'), 'utf8'),
    ).toBe('other runtime');
    expect(await readdir(fixtures.storage.javaDir)).toEqual(['17', '8']);
});

it('rejects a damaged downloaded archive before extraction', async () => {
    fixtures.download.mockImplementation(async (_url, destination: string) => {
        await writeFile(destination, 'truncated');
    });
    await expect(
        new JavaManager().checkAndDownloadJava(17, windowArg()),
    ).rejects.toThrow('archive checksum mismatch');
    expect(ZipHelper.unzip).not.toHaveBeenCalled();
    expect(await readdir(fixtures.storage.javaDir)).toEqual([]);
});

it('cleans a partially downloaded file and can retry on the same manager', async () => {
    fixtures.download.mockImplementationOnce(
        async (_url, destination: string) => {
            await writeFile(destination, 'partial');
            throw new Error('connection interrupted');
        },
    );
    const manager = new JavaManager();
    await expect(manager.checkAndDownloadJava(17, windowArg())).rejects.toThrow(
        'connection interrupted',
    );
    expect(await readdir(fixtures.storage.javaDir)).toEqual([]);
    await manager.checkAndDownloadJava(17, windowArg());
    expect(await manager.getJavaPath(17)).toContain('java.exe');
});

it('cleans a failed extraction and keeps the existing directory untouched', async () => {
    await mkdir(join(fixtures.storage.javaDir, '17'), { recursive: true });
    await writeFile(
        join(fixtures.storage.javaDir, '17/old'),
        'keep until replacement is ready',
    );
    fixtures.unzip.mockRejectedValue(new Error('corrupt ZIP'));
    await expect(
        new JavaManager().checkAndDownloadJava(17, windowArg()),
    ).rejects.toThrow('corrupt ZIP');
    expect(
        await readFile(join(fixtures.storage.javaDir, '17/old'), 'utf8'),
    ).toBe('keep until replacement is ready');
    expect(await readdir(fixtures.storage.javaDir)).toEqual(['17']);
});

it('rejects a malformed ZIP even if its download checksum matches', async () => {
    const actual = await vi.importActual<
        typeof import('@aurora-launcher/core')
    >('@aurora-launcher/core');
    fixtures.unzip.mockImplementation(
        actual.ZipHelper.unzip.bind(actual.ZipHelper),
    );
    await expect(
        new JavaManager().checkAndDownloadJava(17, windowArg()),
    ).rejects.toThrow();
    expect(await readdir(fixtures.storage.javaDir)).toEqual([]);
});

it('replaces an existing executable that cannot initialize its VM', async () => {
    await unpack(join(fixtures.storage.javaDir, '17'));
    fixtures.execFile.mockImplementationOnce(
        (_file, _args, _options, callback) =>
            callback(new Error('broken runtime'), '', ''),
    );
    await new JavaManager().checkAndDownloadJava(17, windowArg());
    expect(fixtures.download).toHaveBeenCalledOnce();
    expect(fixtures.execFile).toHaveBeenCalledTimes(2);
});

it('awaits verification of extracted files and rejects a mismatch', async () => {
    fixtures.unzip.mockImplementation(async (_file, destination: string) =>
        unpack(destination, 'zulu/bin/java.exe', true),
    );
    await expect(
        new JavaManager().checkAndDownloadJava(17, windowArg()),
    ).rejects.toThrow('extracted file checksum mismatch');
    expect(fixtures.execFile).not.toHaveBeenCalled();
    expect(await readdir(fixtures.storage.javaDir)).toEqual([]);
});

it('does not publish an installation whose java -version fails', async () => {
    fixtures.execFile.mockImplementation((_file, _args, _options, callback) =>
        callback(new Error('VM cannot initialize'), '', ''),
    );
    await expect(
        new JavaManager().checkAndDownloadJava(17, windowArg()),
    ).rejects.toThrow('runtime cannot be started');
    expect(await readdir(fixtures.storage.javaDir)).toEqual([]);
});

it('rejects a runtime with the wrong major version', async () => {
    fixtures.execFile.mockImplementation((_file, _args, _options, callback) =>
        callback(null, '', 'java version "1.8.0_422"'),
    );
    await expect(
        new JavaManager().checkAndDownloadJava(17, windowArg()),
    ).rejects.toThrow('Expected Java 17');
    expect(await readdir(fixtures.storage.javaDir)).toEqual([]);
});

it('accepts the Java 8 version format', async () => {
    await unpack(join(fixtures.storage.javaDir, '8'));
    fixtures.execFile.mockImplementation((_file, _args, _options, callback) =>
        callback(null, '', 'java version "1.8.0_422"'),
    );
    await new JavaManager().checkAndDownloadJava(8, windowArg());
    expect(fixtures.download).not.toHaveBeenCalled();
});

it('reports an unavailable package without trying to download it', async () => {
    fixtures.metadata.mockResolvedValue([]);
    await expect(
        new JavaManager().checkAndDownloadJava(17, windowArg()),
    ).rejects.toThrow('No Java 17 runtime found');
    expect(fixtures.download).not.toHaveBeenCalled();
});

it('shares concurrent installation requests and waits for extraction before publishing', async () => {
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
        finish = resolve;
    });
    fixtures.unzip.mockImplementation(async (_file, destination: string) => {
        await pending;
        return unpack(destination);
    });
    const manager = new JavaManager();
    const first = manager.checkAndDownloadJava(17, windowArg());
    expect(manager.checkAndDownloadJava(17, windowArg())).toBe(first);
    await vi.waitFor(() => expect(fixtures.unzip).toHaveBeenCalledTimes(1));
    expect(await readdir(fixtures.storage.javaDir)).not.toContain('17');
    finish();
    await first;
    expect(fixtures.download).toHaveBeenCalledTimes(1);
    expect(await readdir(fixtures.storage.javaDir)).toEqual(['17']);
});

describe.each([
    'zulu/bin/java',
    'zulu/zulu-17.jre/Contents/Home/bin/java',
    'zulu/Contents/Home/bin/java',
])('macOS layout %s', (executable) => {
    it('discovers the runtime and sets octal executable permissions', async () => {
        Object.assign(PlatformHelper, {
            isWindows: false,
            isLinux: false,
            isMac: true,
        });
        fixtures.unzip.mockImplementation(async (_file, destination: string) =>
            unpack(destination, executable),
        );
        const manager = new JavaManager();
        await manager.checkAndDownloadJava(17, windowArg());
        expect(await manager.getJavaPath(17)).toBe(
            join(fixtures.storage.javaDir, '17', executable),
        );
        expect(fixtures.chmod).toHaveBeenCalledWith(expect.any(String), 0o744);
    });
});
