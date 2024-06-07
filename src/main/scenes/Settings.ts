import { EVENTS } from '../../common/channels'
import { ipcMain } from 'electron'
import { SettingsHelper } from '../helpers/SettingsHelper'
import { Service } from 'typedi'

import { IHandleable } from '../core/IHandleable'

@Service()
export class SettingsScene implements IHandleable {
    initHandlers(): void {
        ipcMain.handle(
            EVENTS.SCENES.SETTINGS.SET_FIELD,
            (_, field: string, value: string | boolean | number) =>
                SettingsHelper.setField(field, value),
        );
        ipcMain.handle(EVENTS.SCENES.SETTINGS.GET_FIELD, (_, field: string) =>
            SettingsHelper.getField(field),
        );
        ipcMain.handle(EVENTS.SCENES.SETTINGS.GET_ALL_FIELDS, () =>
            SettingsHelper.getAllFields(),
        );
        ipcMain.handle(EVENTS.SCENES.SETTINGS.GET_TOTAL_MEMORY, () =>
            SettingsHelper.getTotalMemory(),
        );
    }
}
