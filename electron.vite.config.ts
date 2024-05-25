import { join } from 'path';

import { defineConfig, swcPlugin } from "electron-vite";

const toDir = (dir: string) => join(__dirname, dir);

export default defineConfig({
    main: {
        plugins: [swcPlugin()],
        build: {
            sourcemap: true,
            outDir: toDir('build/main'),
            emptyOutDir: true,
            minify: true,
            reportCompressedSize: true
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
            outDir: toDir('build/preload'),
            emptyOutDir: true,
            minify: true,
            reportCompressedSize: true
        },
    },
    renderer: {
        root: toDir('src/renderer'),
        cacheDir: toDir('node_modules/.vite'),
        base: '',
        build: {
            sourcemap: true,
            outDir: toDir('build/renderer'),
            assetsDir: '.',
            emptyOutDir: true,
            minify: true,
            reportCompressedSize: true
        },
    }
  })
