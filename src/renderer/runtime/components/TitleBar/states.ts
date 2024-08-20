import { atom } from 'recoil';
import { window } from '@config';

import { getUserData } from '../../../utils';

export const titlebarBackBtn = atom({
    key: 'titlebar.backBtn',
    default: {
        show: false,
    },
});

export const titlebarLogout = atom({
    key: 'titlebar.logout',
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
        text: window.title,
    },
});

export const titlebarUser = atom({
    key: 'titlebar.user',
    default: getUserData().username || '',
});
