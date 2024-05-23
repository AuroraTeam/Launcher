import { join } from 'path';

import { defineConfig } from 'vitest/config';

const toDir = (dir: string) => join(__dirname, dir);

export default defineConfig({
    test: {
        root: 'src',
    },
    resolve: {
        alias: [
            {
                find: '@config',
                replacement: toDir('config.ts'),
            },
        ],
    },
});
