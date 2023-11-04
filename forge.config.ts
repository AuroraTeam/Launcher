import { ForgeConfig } from '@electron-forge/shared-types';

const config: ForgeConfig = {
    packagerConfig: {
        asar: true,
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
        {
            name: '@electron-forge/maker-squirrel',
            config: {},
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
            config: {},
        },
        {
            name: '@electron-forge/maker-deb',
            config: {},
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {},
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {},
        },
    ],
};

export default config;
