import { join } from 'path';

import { defineConfig } from 'electron-vite';

const toDir = (dir: string) => join(__dirname, dir);

export default defineConfig({
    main: {
        plugins: [],
        build: {
            sourcemap: true,
        },
        resolve: {
            alias: [
                {
                    find: '@config',
                    replacement: toDir('config.ts'),
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
            sourcemap: true,
        },
    },
});
