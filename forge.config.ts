import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';

const config: ForgeConfig = {
    packagerConfig: {
        ignore(path) {
            if (!path) return false;
            if (path.startsWith('/package.json')) return false;
            if (path.startsWith('/build')) return false;
            if (path === '/node_modules') return false;
            if (path.startsWith('/node_modules/electron-squirrel-startup'))
                return false;
            return true;
        },
    },
    rebuildConfig: {},
    makers: [
        new MakerSquirrel({}),
        new MakerZIP({}, ['darwin']),
        new MakerRpm({}),
        new MakerDeb({}),
    ],
    plugins: [],
};

export default config;
