import { createHash } from "crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "fs/promises";
import { dirname, join } from "path";

import { HashedFile, Profile } from "@aurora-launcher/core";
import { afterEach, beforeEach, expect, expectTypeOf, it, vi } from "vitest";

import { APIManager } from "../api/APIManager";
import { Updater } from "./Updater";

const fixtures = vi.hoisted(() => ({
    download: vi.fn(),
    resource: vi.fn(),
    storage: { clientsDir: "", librariesDir: "", assetsDir: "" },
}));
vi.mock("@freshgum/typedi", () => ({ Service: () => (target: unknown) => target }));
vi.mock("@aurora-launcher/core", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@aurora-launcher/core")>();
    return {
        ...actual,
        HttpHelper: { downloadSafeFile: fixtures.download, getResource: fixtures.resource },
    };
});
vi.mock("../api/APIManager", () => ({ APIManager: class {} }));
vi.mock("./GameWindow", () => ({ GameWindow: class {} }));
vi.mock("../helpers/StorageHelper", () => ({ StorageHelper: fixtures.storage }));
vi.mock("../utils/retry", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../utils/retry")>();
    return { retry: <T>(fn: () => Promise<T>, attempts: number) => actual.retry(fn, attempts, 0) };
});

const sha1 = (data: string) => createHash("sha1").update(data).digest("hex");
const profile = (extra: Partial<Profile> = {}) =>
    ({
        clientDir: "test",
        update: [],
        updateVerify: [],
        updateExclusions: [],
        ...extra,
    }) as Profile;
function makeUpdater() {
    const api = { getUpdates: vi.fn() };
    const window = { sendToConsole: vi.fn(), sendProgress: vi.fn() };
    const updater = new Updater(
        ...([api, window] as unknown as ConstructorParameters<typeof Updater>),
    );
    return { updater, api, window };
}
let root: string;
beforeEach(async () => {
    vi.clearAllMocks();
    fixtures.download.mockReset();
    fixtures.resource.mockReset();
    root = await mkdtemp(join(process.cwd(), ".updater-test-"));
    Object.assign(fixtures.storage, {
        clientsDir: join(root, "clients"),
        librariesDir: join(root, "libraries"),
        assetsDir: join(root, "assets"),
    });
    await Promise.all(Object.values(fixtures.storage).map((dir) => mkdir(dir)));
});
afterEach(async () => {
    await rm(root, { recursive: true, force: true });
});
async function put(path: string, data: string) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, data);
}
function replyWith(data: string) {
    fixtures.download.mockImplementation(async (_url, path: string) => {
        await put(path, data);
    });
}
function assetIndex(data: string) {
    const entry = { hash: sha1(data), size: Buffer.byteLength(data) };
    fixtures.resource.mockResolvedValue(
        JSON.stringify({ objects: { one: entry, duplicate: entry } }),
    );
    return join(fixtures.storage.assetsDir, "objects", entry.hash.slice(0, 2), entry.hash);
}

it("keeps progress at zero for an empty file", async () => {
    const { updater, api, window } = makeUpdater();
    api.getUpdates.mockResolvedValue([{ path: "/test/empty", sha1: sha1(""), size: 0 }]);
    replyWith("");
    await updater.validateGameFiles(profile());
    expect(window.sendProgress).toHaveBeenLastCalledWith({ total: 0, loaded: 0, type: "size" });
});

it("waits for other downloads to finish before rejecting a failed stage", async () => {
    const { updater } = makeUpdater();
    let finish!: () => void;
    const gate = new Promise<void>((resolve) => {
        finish = resolve;
    });
    fixtures.download.mockImplementation(async (_url, path: string) => {
        if (path.endsWith("broken.jar")) throw new Error("connection interrupted");
        await gate;
    });
    let settled = false;
    const pending = updater.validateLibraries([
        { path: "broken.jar", sha1: sha1("broken"), type: "library" },
        { path: "pending.jar", sha1: sha1("pending"), type: "library" },
    ]);
    void pending.then(
        () => {
            settled = true;
        },
        () => {
            settled = true;
        },
    );
    await vi.waitFor(() => expect(fixtures.download).toHaveBeenCalledTimes(4));
    expect(settled).toBe(false);
    finish();
    await expect(pending).rejects.toThrow();
});

it("exposes a typed file list from the API", () => {
    expectTypeOf<ReturnType<APIManager["getUpdates"]>>().toEqualTypeOf<Promise<HashedFile[]>>();
});
it("propagates a missing client error before reporting a successful update", async () => {
    const { updater, api, window } = makeUpdater();
    api.getUpdates.mockRejectedValue(new Error("Client not found"));
    await expect(updater.validateGameFiles(profile())).rejects.toThrow("Client not found");
    expect(fixtures.download).not.toHaveBeenCalled();
    expect(window.sendToConsole).not.toHaveBeenCalledWith("Client files loaded");
});
it("accepts an empty client but rejects a malformed response", async () => {
    const { updater, api } = makeUpdater();
    api.getUpdates.mockResolvedValueOnce([]).mockResolvedValueOnce({ error: "missing" });
    await expect(updater.validateGameFiles(profile())).resolves.toEqual([]);
    await expect(updater.validateGameFiles(profile())).rejects.toThrow(
        "Invalid client files response",
    );
});
it("orders a copy of the response and totals progress", async () => {
    const { updater, api, window } = makeUpdater();
    const small = { path: "/test/small", size: 10, sha1: sha1("small") };
    const large = { path: "/test/large", size: 20, sha1: sha1("large") };
    await put(join(fixtures.storage.clientsDir, small.path), "user data");
    await put(join(fixtures.storage.clientsDir, large.path), "user data");
    api.getUpdates.mockResolvedValue(Object.freeze([small, large]));
    await expect(updater.validateGameFiles(profile())).resolves.toEqual([large, small]);
    expect(window.sendProgress).toHaveBeenLastCalledWith({ total: 30, loaded: 30, type: "size" });
    expect(fixtures.download).not.toHaveBeenCalled();
});
it("repairs damaged assets using SHA-1 and deduplicates identical asset objects", async () => {
    const { updater, window } = makeUpdater();
    const path = assetIndex("asset");
    await put(path, "damaged");
    replyWith("asset");
    await updater.validateAssets("test");
    expect(fixtures.download).toHaveBeenCalledExactlyOnceWith(expect.any(URL), path, {
        sha1: sha1("asset"),
    });
    expect(await readFile(path, "utf8")).toBe("asset");
    expect(window.sendProgress).toHaveBeenLastCalledWith({ total: 5, loaded: 5, type: "size" });
    expect(await readdir(join(fixtures.storage.assetsDir, "indexes"))).toEqual(["test.json"]);
});
it("reuses assets with a matching checksum without downloading", async () => {
    const path = assetIndex("valid");
    await put(path, "valid");
    await makeUpdater().updater.validateAssets("test");
    expect(fixtures.download).not.toHaveBeenCalled();
});
it.each(["not-json", "{}", '{"objects":{"bad":{"hash":"bad","size":1}}}'])(
    "preserves the previous asset index when new metadata is invalid (%s)",
    async (metadata) => {
        const path = join(fixtures.storage.assetsDir, "indexes/test.json");
        await put(path, "previous index");
        fixtures.resource.mockResolvedValue(metadata);
        await expect(makeUpdater().updater.validateAssets("test")).rejects.toThrow();
        expect(await readFile(path, "utf8")).toBe("previous index");
        expect(fixtures.download).not.toHaveBeenCalled();
    },
);
it("retries a failed library download and does not report progress before verification finishes", async () => {
    const { updater, window } = makeUpdater();
    const path = join(fixtures.storage.librariesDir, "game.jar");
    await put(path, "previous");
    let finish!: () => void;
    const gate = new Promise<void>((resolve) => {
        finish = resolve;
    });
    fixtures.download
        .mockRejectedValueOnce(new Error("SHA-1 mismatch"))
        .mockImplementationOnce(async () => {
            await gate;
            await put(path, "verified");
        });
    const pending = updater.validateLibraries([
        { path: "game.jar", sha1: sha1("verified"), type: "library" },
    ]);
    await vi.waitFor(() => expect(fixtures.download).toHaveBeenCalledTimes(2));
    expect(await readFile(path, "utf8")).toBe("previous");
    expect(window.sendProgress).not.toHaveBeenCalled();
    finish();
    await pending;
    expect(window.sendProgress).toHaveBeenCalledExactlyOnceWith({
        total: 1,
        loaded: 1,
        type: "count",
    });
});
it("exhausts retries and prevents a successful library update", async () => {
    const { updater, window } = makeUpdater();
    fixtures.download.mockRejectedValue(new Error("connection interrupted"));
    await expect(
        updater.validateLibraries([{ path: "game.jar", sha1: sha1("data"), type: "library" }]),
    ).rejects.toThrow();
    expect(fixtures.download).toHaveBeenCalledTimes(3);
    expect(window.sendProgress).not.toHaveBeenCalled();
    expect(window.sendToConsole).not.toHaveBeenCalledWith("Libraries files loaded");
});
it.each([false, true])(
    "preserves mutable files but checks protected client files (protected: %s)",
    async (protectedFile) => {
        const { updater, api } = makeUpdater();
        const file = { path: "/test/game.jar", sha1: sha1("server"), size: 6 };
        api.getUpdates.mockResolvedValue([file]);
        const path = join(fixtures.storage.clientsDir, file.path);
        await put(path, "user");
        replyWith("server");
        await updater.validateGameFiles(profile({ update: protectedFile ? ["game.jar"] : [] }));
        expect(await readFile(path, "utf8")).toBe(protectedFile ? "server" : "user");
        expect(fixtures.download).toHaveBeenCalledTimes(protectedFile ? 1 : 0);
    },
);
it("preserves excluded files and verifies missing client files even outside protected paths", async () => {
    const { updater, api } = makeUpdater();
    const excluded = { path: "/test/config.json", sha1: sha1("config"), size: 6 };
    const missing = { path: "/test/missing.jar", sha1: sha1("download"), size: 8 };
    const path = join(fixtures.storage.clientsDir, excluded.path);
    await put(path, "user");
    api.getUpdates.mockResolvedValue([excluded, missing]);
    replyWith("download");
    await updater.validateGameFiles(
        profile({ update: ["config.json"], updateExclusions: ["config.json"] }),
    );
    expect(await readFile(path, "utf8")).toBe("user");
    expect(fixtures.download).toHaveBeenCalledExactlyOnceWith(
        expect.any(URL),
        join(fixtures.storage.clientsDir, missing.path),
        { sha1: missing.sha1 },
    );
});
