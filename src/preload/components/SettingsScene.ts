import { ipcRenderer } from 'electron';

import { EVENTS } from '../../common/channels';
import { SettingsFormat } from '../../common/types';

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

    static getAllFields():Promise<SettingsFormat> {
        return ipcRenderer.invoke(EVENTS.SCENES.SETTINGS.GET_ALL_FIELDS);
    }
    static getTotalMemory():Promise<number> {
        return ipcRenderer.invoke(EVENTS.SCENES.SETTINGS.GET_TOTAL_MEMORY);
    }
}
