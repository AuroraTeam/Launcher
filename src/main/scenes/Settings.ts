import { Service } from '@freshgum/typedi';
import { ipcMain } from 'electron';

import { EVENTS } from '../../common/channels';
import { SettingsFormat } from '../../common/types';
import { IHandleable } from '../core/IHandleable';
import { getMemoryLimits } from '../helpers/MemoryHelper';
import { SettingsHelper } from '../helpers/SettingsHelper';

@Service([])
export class SettingsScene implements IHandleable {
    initHandlers(): void {
        ipcMain.handle(
            EVENTS.SCENES.SETTINGS.SET_FIELD,
            <T extends keyof SettingsFormat>(
                _: any,
                field: T,
                value: SettingsFormat[T],
            ) => SettingsHelper.setField(field, value),
        );

        ipcMain.handle(
            EVENTS.SCENES.SETTINGS.GET_FIELD,
            <T extends keyof SettingsFormat>(_: any, field: T) =>
                SettingsHelper.getField(field),
        );

        ipcMain.handle(EVENTS.SCENES.SETTINGS.GET_ALL_FIELDS, () =>
            SettingsHelper.getAllFields(),
        );

        ipcMain.handle(EVENTS.SCENES.SETTINGS.GET_MEMORY_LIMITS, () =>
            getMemoryLimits(),
        );
    }
}
