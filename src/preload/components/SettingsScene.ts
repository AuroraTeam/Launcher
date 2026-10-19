import { ipcRenderer } from 'electron';

import { EVENTS } from '../../common/channels';
import { MemoryLimits } from '../../common/memory';
import { SettingsFormat } from '../../common/types';

export default class SettingsScene {
    static setField<T extends keyof SettingsFormat>(
        field: T,
        value: SettingsFormat[T],
    ): Promise<void> {
        return ipcRenderer.invoke(
            EVENTS.SCENES.SETTINGS.SET_FIELD,
            field,
            value,
        );
    }

    static getField<T extends keyof SettingsFormat>(
        field: T,
    ): Promise<SettingsFormat[T]> {
        return ipcRenderer.invoke(EVENTS.SCENES.SETTINGS.GET_FIELD, field);
    }

    static getAllFields(): Promise<SettingsFormat> {
        return ipcRenderer.invoke(EVENTS.SCENES.SETTINGS.GET_ALL_FIELDS);
    }
    static getMemoryLimits(): Promise<MemoryLimits> {
        return ipcRenderer.invoke(EVENTS.SCENES.SETTINGS.GET_MEMORY_LIMITS);
    }
}
