import { ipcRenderer } from 'electron';

export default class Window {
    /**
     * Hide window
     */
    static hide() {
        ipcRenderer.send('window:hide');
    }

    /**
     * Show window
     */
    static show() {
        ipcRenderer.send('window:close');
    }
}
