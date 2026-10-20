import { join } from "path";

import { defineConfig } from "electron-vite";

const toDir = (dir: string) => join(__dirname, dir);

export default defineConfig({
    main: {
        build: {
            sourcemap: true,
            minify: true,
        },
        resolve: {
            alias: [
                {
                    find: "@config",
                    replacement: toDir("config.ts"),
                },
            ],
        },
    },
    preload: {
        build: {
            sourcemap: true,
        },
    },
    renderer: {
        build: {
            minify: true,
            chunkSizeWarningLimit: 1000,
            sourcemap: true,
        },
        resolve: {
            alias: [
                {
                    find: "@config",
                    replacement: toDir("config.ts"),
                },
            ],
        },
        server: {
            fs: {
                strict: false,
            },
        },
    },
});
