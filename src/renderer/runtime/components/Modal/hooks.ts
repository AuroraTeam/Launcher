import { useSetAtom } from 'jotai';
import { ReactNode } from 'react';

import { modalContent, modalShow, modalTitle } from './states';

export function useModal() {
    const setShow = useSetAtom(modalShow);
    const setContent = useSetAtom(modalContent);
    const setTitle = useSetAtom(modalTitle);

    return {
        showModal: (title: string, content: ReactNode) => {
            setTitle(title);
            setContent(content);
            setShow(true);
        },
    };
}
