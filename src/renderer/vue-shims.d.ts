declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}
declare interface Window {
    launcherAPI: typeof import('../preload/index').api;
}
