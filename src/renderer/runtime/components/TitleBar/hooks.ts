import { useSetAtom } from 'jotai';
import { useResetAtom } from 'jotai/utils';

import {
    titlebarBackBtn,
    titlebarLogout,
    titlebarSettingsBtn,
    titlebarTitle,
    titlebarUser,
} from './states';

export function useTitlebar() {
    const setTitlebarBackBtnState = useSetAtom(titlebarBackBtn);

    function showTitlebarBackBtn() {
        setTitlebarBackBtnState({ show: true });
    }

    function hideTitlebarBackBtn() {
        setTitlebarBackBtnState({ show: false });
    }

    const setTitlebarLogoutBtnState = useSetAtom(titlebarLogout);

    function showTitlebarLogoutBtn() {
        setTitlebarLogoutBtnState({ show: true });
    }

    function hideTitlebarLogoutBtn() {
        setTitlebarLogoutBtnState({ show: false });
    }

    const setTitlebarSettingsBtnState = useSetAtom(titlebarSettingsBtn);

    function showTitlebarSettingsBtn() {
        setTitlebarSettingsBtnState({ show: true });
    }

    function hideTitlebarSettingsBtn() {
        setTitlebarSettingsBtnState({ show: false });
    }

    const setTitlebarTitleState = useSetAtom(titlebarTitle);

    const resetTitlebarTitleState = useResetAtom(titlebarTitle);

    function showTitlebarTitle() {
        setTitlebarTitleState((state) => ({ ...state, show: true }));
    }

    function hideTitlebarTitle() {
        setTitlebarTitleState((state) => ({ ...state, show: false }));
    }

    function setTitlebarTitleText(text: string) {
        setTitlebarTitleState((state) => ({ ...state, text }));
    }

    function resetTitlebarTitleText() {
        resetTitlebarTitleState();
    }

    const setTitlebarUserText = useSetAtom(titlebarUser);

    return {
        showTitlebarBackBtn,
        hideTitlebarBackBtn,
        showTitlebarLogoutBtn,
        hideTitlebarLogoutBtn,
        showTitlebarSettingsBtn,
        hideTitlebarSettingsBtn,
        showTitlebarTitle,
        hideTitlebarTitle,
        setTitlebarTitleText,
        resetTitlebarTitleText,
        setTitlebarUserText,
    };
}
