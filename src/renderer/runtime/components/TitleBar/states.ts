import { atom } from 'recoil';

import { getUserData } from '../../../utils';

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

export const titlebarUser = atom({
    key: 'titlebar.user',
    default: getUserData().username || '',
});
