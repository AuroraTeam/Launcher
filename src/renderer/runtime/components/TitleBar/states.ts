import { atom } from 'recoil';
import { version } from '../../../../../package.json'

export const titlebarBackBtn = atom({
    key: 'titlebar.backBtn',
    default: {
        show: false,
    },
});

export const titlebarSettingsBtn = atom({
    key: 'titlebar.settingsBtn',
    default: {
        show: false,
    },
});

export const titlebarTitle = atom({
    key: 'titlebar.title',
    default: {
        show: true,
        text: 'AuroraLauncher',
    },
});

export const settingsVersion = atom({
    key: 'settings.version',
    default: {
        show: true,
        text: `v${version}`,
    },
});

export const titlebarUser = atom({
    key: 'titlebar.user',
    default: {
        show: false,
        username: 'Test',
    },
});
