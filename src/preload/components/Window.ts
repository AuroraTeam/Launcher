import { ipcRenderer } from 'electron';

import { EVENTS } from '../../common/channels';

export default class Window {
    /**
     * Hide window
     */
    static hide() {
        ipcRenderer.send(EVENTS.WINDOW.HIDE);
    }

    /**
     * Close window
     */
    static close() {
        ipcRenderer.send(EVENTS.WINDOW.CLOSE);
    }

    /**
     * Open external url
     */
    static openExternal(url: string) {
        ipcRenderer.send(EVENTS.WINDOW.OPEN_EXTERNAL, url);
    }
}
