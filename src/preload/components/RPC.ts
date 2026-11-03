import { ipcRenderer } from "electron";

import { EVENTS } from "../../common/channels";
import { Status } from "../../main/core/DiscordRPC";

export default class RPC {
    static updateActivity(data: Status) {
        ipcRenderer.invoke(EVENTS.RPC.UPDATE_ACTIVITY, data);
    }

    static clearActivity() {
        ipcRenderer.invoke(EVENTS.RPC.CLEAR_ACTIVITY);
    }
}
