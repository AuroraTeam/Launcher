import { useRecoilState, useSetRecoilState } from 'recoil';

import { titlebarBackBtn, titlebarTitle, titlebarUser } from './states';

export function useTitlebar() {
    const [titlebarBackBtnState, setTitlebarBackBtnState] =
        useRecoilState(titlebarBackBtn);

    function showTitlebarBackBtn() {
        if (!titlebarBackBtnState.show) {
            setTitlebarBackBtnState({ show: true });
        }
    }

    function hideTitlebarBackBtn() {
        if (titlebarBackBtnState.show) {
            setTitlebarBackBtnState({ show: false });
        }
    }

    const setTitlebarTitleState = useSetRecoilState(titlebarTitle);

    function showTitlebarTitle() {
        setTitlebarTitleState((state) => ({ ...state, show: true }));
    }

    function hideTitlebarTitle() {
        setTitlebarTitleState((state) => ({ ...state, show: false }));
    }

    function setTitlebarTitleText(text: string) {
        setTitlebarTitleState((state) => ({ ...state, text }));
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
        showTitlebarTitle,
        hideTitlebarTitle,
        setTitlebarTitleText,
        showTitlebarUser,
        hideTitlebarUser,
        setTitlebarUserText,
    };
}
