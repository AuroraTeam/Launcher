import { createHash } from 'crypto';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';

import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { AuthlibInjector } from './AuthlibInjector';

const fixtures = vi.hoisted(() => ({
    storage: { storageDir: '' },
    metadata: vi.fn(),
    download: vi.fn(),
    info: vi.fn(),
}));
vi.mock('@freshgum/typedi', () => ({
    Service: () => (target: unknown) => target,
}));
vi.mock('../helpers/StorageHelper', () => ({
    StorageHelper: fixtures.storage,
}));
vi.mock('../helpers/LogHelper', () => ({ LogHelper: { info: fixtures.info } }));
vi.mock('@aurora-launcher/core', async (original) => ({
    ...(await original<typeof import('@aurora-launcher/core')>()),
    HttpHelper: {
        getResourceFromJson: fixtures.metadata,
        downloadFile: fixtures.download,
    },
}));

const jar = Buffer.from('verified injector');
const checksum = createHash('sha256').update(jar).digest('hex');
let root: string;

beforeEach(async () => {
    vi.clearAllMocks();
    root = await mkdtemp(join(process.cwd(), '.authlib-test-'));
    fixtures.storage.storageDir = root;
    fixtures.metadata
        .mockReset()
        .mockResolvedValue({
            download_url: 'https://example.test/authlib.jar',
            checksums: { sha256: checksum },
        });
    fixtures.download
        .mockReset()
        .mockImplementation(async (_url, file: string) => {
            await writeFile(file, jar);
            return file;
        });
});
afterEach(async () => {
    await rm(root, { recursive: true, force: true });
});

it('publishes only the verified JAR and saves its checksum for offline reuse', async () => {
    const injector = new AuthlibInjector();
    await injector.verify();
    expect(await readFile(injector.authlibFilePath)).toEqual(jar);
    expect(await readFile(`${injector.authlibFilePath}.sha256`, 'utf8')).toBe(
        checksum,
    );
    expect(await readdir(root)).toEqual(['authlib.jar', 'authlib.jar.sha256']);
    fixtures.metadata.mockRejectedValue(new Error('offline'));
    await new AuthlibInjector().verify();
    expect(fixtures.download).toHaveBeenCalledTimes(1);
    expect(fixtures.metadata).toHaveBeenCalledTimes(1);
});

it('validates an existing legacy JAR before trusting it and avoids an unnecessary download', async () => {
    await writeFile(join(root, 'authlib.jar'), jar);
    await new AuthlibInjector().verify();
    expect(fixtures.metadata).toHaveBeenCalledTimes(1);
    expect(fixtures.download).not.toHaveBeenCalled();
    expect(await readFile(join(root, 'authlib.jar.sha256'), 'utf8')).toBe(
        checksum,
    );
});

it('repairs an existing JAR whose contents no longer match the saved checksum', async () => {
    await writeFile(join(root, 'authlib.jar'), 'damaged');
    await writeFile(join(root, 'authlib.jar.sha256'), checksum);
    await new AuthlibInjector().verify();
    expect(fixtures.download).toHaveBeenCalledTimes(1);
    expect(await readFile(join(root, 'authlib.jar'))).toEqual(jar);
});

it('rejects a bad downloaded checksum, cleans staging and reports no success', async () => {
    fixtures.download.mockImplementation(async (_url, file: string) => {
        await writeFile(file, 'corrupt');
    });
    await expect(new AuthlibInjector().verify()).rejects.toThrow(
        'Authlib checksum mismatch',
    );
    expect(await readdir(root)).toEqual([]);
    expect(fixtures.info).not.toHaveBeenCalled();
});

it('keeps the previous file on a failed download and supports retry', async () => {
    await writeFile(join(root, 'authlib.jar'), 'previous');
    fixtures.download.mockImplementationOnce(async (_url, file: string) => {
        await writeFile(file, 'partial');
        throw new Error('connection lost');
    });
    const injector = new AuthlibInjector();
    await expect(injector.verify()).rejects.toThrow('connection lost');
    expect(await readFile(injector.authlibFilePath, 'utf8')).toBe('previous');
    expect(await readdir(root)).toEqual(['authlib.jar']);
    await injector.verify();
    expect(await readFile(injector.authlibFilePath)).toEqual(jar);
});

it('propagates metadata errors instead of continuing the game launch', async () => {
    fixtures.metadata.mockRejectedValue(new Error('offline'));
    await expect(new AuthlibInjector().verify()).rejects.toThrow(
        'Failed to check Authlib Injector API',
    );
    expect(fixtures.download).not.toHaveBeenCalled();
    expect(fixtures.info).not.toHaveBeenCalled();
});

it('rejects metadata without a valid checksum', async () => {
    fixtures.metadata.mockResolvedValue({
        download_url: 'https://example.test/file',
        checksums: { sha256: '' },
    });
    await expect(new AuthlibInjector().verify()).rejects.toThrow(
        'Invalid Authlib Injector metadata',
    );
    expect(fixtures.download).not.toHaveBeenCalled();
});

it('shares concurrent verification and downloads', async () => {
    const injector = new AuthlibInjector();
    const verification = injector.verify();
    expect(injector.verify()).toBe(verification);
    await verification;
    expect(fixtures.download).toHaveBeenCalledTimes(1);
});
