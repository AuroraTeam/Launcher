declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}
declare interface Window {
    ipcRenderer: Electron.IpcRenderer;
}
