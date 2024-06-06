import { SetActivity } from '@xhayper/discord-rpc'
import { EVENTS } from '../../common/channels'
import { ipcRenderer } from 'electron'

export default class RPC {
	static updateActivity(data: SetActivity) {
			ipcRenderer.invoke(EVENTS.RPC.UPDATE_ACTIVITY, data);
	}

	static clearActivity() {
		ipcRenderer.invoke(EVENTS.RPC.CLEAR_ACTIVITY);
	}
}
