import { totalmem } from 'os';

import { Service } from '@freshgum/typedi';
import { ipcMain } from 'electron';

import { EVENTS } from '../../common/channels';
import { SettingsFormat } from '../../common/types';
import { IHandleable } from '../core/IHandleable';
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

        ipcMain.handle(EVENTS.SCENES.SETTINGS.GET_TOTAL_MEMORY, () => {
            const remainingMemMegabytes =
                Math.floor(totalmem() / 1024 ** 2) / 2;

            return (
                remainingMemMegabytes -
                (remainingMemMegabytes % 1024) +
                (remainingMemMegabytes % 1024 ? 1024 : 0)
            );
        });
    }
}
