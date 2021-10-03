import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('launcherAPI', {
    ipc: {
        on: ipcRenderer.on,
        send: ipcRenderer.send,
        invoke: ipcRenderer.invoke,
    },
});
