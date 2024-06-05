import { ipcRenderer } from 'electron';

import { EVENTS } from '../../common/channels';

export default class SettingsScene {
    static setField(field: string, value: string) {
        return ipcRenderer.invoke(
            EVENTS.SCENES.SETTINGS.SET_FIELD,
            field,
            value,
        );
    }

    static getField(field: string) {
        return ipcRenderer.invoke(EVENTS.SCENES.SETTINGS.GET_FIELD, field);
    }

    static getAllFields() {
        return ipcRenderer.invoke(EVENTS.SCENES.SETTINGS.GET_ALL_FIELDS);
    }
    static getTotalMemory() {
        return ipcRenderer.invoke(EVENTS.SCENES.SETTINGS.GET_TOTAL_MEMORY);
    }
}
