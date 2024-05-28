import { ipcRenderer } from 'electron';

import { EVENTS } from '../../common/channels';
import { Settings } from '../../main/helpers/SettingsHelper'

export default class SettingsScene {
    static edit(type: Settings) {
        return ipcRenderer.invoke(EVENTS.SCENES.SETTINGS.EDIT, type);
    }

    static check(): Promise<Settings> {
        return ipcRenderer.invoke(EVENTS.SCENES.SETTINGS.CHECK);
    }
}
