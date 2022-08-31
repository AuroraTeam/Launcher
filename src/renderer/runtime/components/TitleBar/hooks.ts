import { useSetRecoilState } from 'recoil';

import { titlebarBackBtn, titlebarTitle, titlebarUser } from './states';

const setTitlebarBackBtnState = useSetRecoilState(titlebarBackBtn);

export function showTitlebarBackBtn() {
    setTitlebarBackBtnState({ show: true });
}

export function hideTitlebarBackBtn() {
    setTitlebarBackBtnState({ show: false });
}

const setTitlebarTitleState = useSetRecoilState(titlebarTitle);

export function showTitlebarTitle() {
    setTitlebarTitleState((state) => ({ ...state, show: true }));
}

export function hideTitlebarTitle() {
    setTitlebarTitleState((state) => ({ ...state, show: false }));
}

export function setTitlebarTitleText(text: string) {
    setTitlebarTitleState((state) => ({ ...state, text }));
}

const setTitlebarUserState = useSetRecoilState(titlebarUser);

export function showTitlebarUser() {
    setTitlebarUserState((state) => ({ ...state, show: true }));
}

export function hideTitlebarUser() {
    setTitlebarUserState((state) => ({ ...state, show: false }));
}

export function setTitlebarUserText(text: string) {
    setTitlebarUserState((state) => ({ ...state, text }));
}
