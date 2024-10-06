import { join } from 'path';

import { defineConfig, defineViteConfig } from 'electron-vite';

const toDir = (dir: string) => join(__dirname, dir);

export default defineConfig({
    main: defineViteConfig(({ command }) => {
        if (command === 'build') {
            return {
                plugins: [],
                build: {
                    sourcemap: true,
                    minify: true,
                },
                resolve: {
                    alias: [
                        {
                            find: '@config',
                            replacement: toDir('config.ts'),
                        },
                    ],
                },
            };
        } else {
            return {
                plugins: [],
                build: {
                    sourcemap: true,
                    rollupOptions: {
                        treeshake: {
                            annotations: false,
                        },
                    },
                },
                resolve: {
                    alias: [
                        {
                            find: '@config',
                            replacement: toDir('config.ts'),
                        },
                    ],
                },
            };
        }
    }),
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
                    find: '@config',
                    replacement: toDir('config.ts'),
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
