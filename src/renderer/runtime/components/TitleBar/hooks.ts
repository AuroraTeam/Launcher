import { useResetRecoilState, useSetRecoilState } from 'recoil';

import {
    titlebarBackBtn,
    titlebarSettingsBtn,
    titlebarTitle,
    titlebarUser,
    titlebarLogout,
} from './states';

export function useTitlebar() {
    const setTitlebarBackBtnState = useSetRecoilState(titlebarBackBtn);

    function showTitlebarBackBtn() {
        setTitlebarBackBtnState({ show: true });
    }

    function hideTitlebarBackBtn() {
        setTitlebarBackBtnState({ show: false });
    }

    const setTitlebarLogoutBtnState = useSetRecoilState(titlebarLogout);

    function showTitlebarLogoutBtn() {
        setTitlebarLogoutBtnState({ show: true });
    }

    function hideTitlebarLogoutBtn() {
        setTitlebarLogoutBtnState({ show: false });
    }

    const setTitlebarSettingsBtnState = useSetRecoilState(titlebarSettingsBtn);

    function showTitlebarSettingsBtn() {
        setTitlebarSettingsBtnState({ show: true });
    }

    function hideTitlebarSettingsBtn() {
        setTitlebarSettingsBtnState({ show: false });
    }

    const setTitlebarTitleState = useSetRecoilState(titlebarTitle);

    const resetTitlebarTitleState = useResetRecoilState(titlebarTitle);

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

    const setTitlebarUserText = useSetRecoilState(titlebarUser);

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
