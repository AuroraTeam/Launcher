import { useResetRecoilState, useSetRecoilState } from 'recoil';

import { titlebarBackBtn, titlebarSettingsBtn, titlebarTitle, titlebarUser } from './states';

export function useTitlebar() {
    const setTitlebarBackBtnState = useSetRecoilState(titlebarBackBtn);

    function showTitlebarBackBtn() {
        setTitlebarBackBtnState({ show: true });
    }

    function hideTitlebarBackBtn() {
        setTitlebarBackBtnState({ show: false });
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

    const setTitlebarUserState = useSetRecoilState(titlebarUser);

    function showTitlebarUser() {
        setTitlebarUserState((state) => ({ ...state, show: true }));
    }

    function hideTitlebarUser() {
        setTitlebarUserState((state) => ({ ...state, show: false }));
    }

    function setTitlebarUserText(username: string) {
        setTitlebarUserState((state) => ({ ...state, username }));
    }

    return {
        showTitlebarBackBtn,
        hideTitlebarBackBtn,
        showTitlebarSettingsBtn,
        hideTitlebarSettingsBtn,
        showTitlebarTitle,
        hideTitlebarTitle,
        setTitlebarTitleText,
        resetTitlebarTitleText,
        showTitlebarUser,
        hideTitlebarUser,
        setTitlebarUserText,
    };
}
