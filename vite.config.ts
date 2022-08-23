import { defineConfig } from 'vite';
import { join } from 'path';
import vue from '@vitejs/plugin-vue';

const toDir = (dir: string) => join(__dirname, dir);

export default defineConfig({
    root: toDir('src/renderer'),
    cacheDir: toDir('node_modules/.vite'),
    base: '',
    build: {
        sourcemap: true,
        outDir: toDir('build/renderer'),
        assetsDir: '.',
        emptyOutDir: true,
    },
    plugins: [vue()],
    server: { port: 3000 },
    resolve: {
        alias: [
            {
                find: /@runtime\/(.*)/,
                replacement: toDir('src/renderer/runtime/$1.ts'),
            },
            {
                find: /@scripts\/(.*)/,
                replacement: toDir('src/renderer/scripts/$1.ts'),
            },
        ],
    },
});
