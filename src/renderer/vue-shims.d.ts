/// <reference types="vite/client" />

declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}

declare type LauncherAPI = typeof import('../preload/index').api;
declare interface Window {
    launcherAPI: LauncherAPI;
}
declare const launcherAPI: LauncherAPI;
