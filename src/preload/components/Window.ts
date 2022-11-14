import { ipcRenderer } from 'electron';

import { WINDOW_CLOSE_EVENT, WINDOW_HIDE_EVENT } from '../../common/events';

export default class Window {
    /**
     * Hide window
     */
    static hide() {
        ipcRenderer.send(WINDOW_HIDE_EVENT);
    }

    /**
     * Show window
     */
    static show() {
        ipcRenderer.send(WINDOW_CLOSE_EVENT);
    }
}
