export const EVENTS = {
    WINDOW: {
        HIDE: 'window:hide',
        CLOSE: 'window:close',
        OPEN_EXTERNAL: 'window:openExternal',
    },
    RPC: {
        UPDATE_ACTIVITY: 'discordrpc:updateactivty',
        CLEAR_ACTIVITY: 'discordrpc:clearactivity'
    },
    SCENES: {
        LOGIN: {
            AUTH: 'scenes:login:auth',
        },
        SERVERS_LIST: {
            GET_SERVERS: 'scenes:serversList:getServers',
            SELECT_SERVER: 'scenes:serversList:selectServer',
            PING_SERVER: 'scenes:serversList:pingServer',
        },
        SERVER_PANEL: {
            GET_PROFILE: 'scenes:serverPanel:getProfile',
            GET_SERVER: 'scenes:serverPanel:getServer',
            START_GAME: 'scenes:serverPanel:startGame',
            TEXT_TO_CONSOLE: 'scenes:serverPanel:textToConsole',
            LOAD_PROGRESS: 'scenes:serverPanel:loadProgress',
            STOP_GAME: 'scenes:serverPanel:stopGame',
        },
        SETTINGS: {
            SET_FIELD: 'scenes:settings:setField',
            GET_FIELD: 'scenes:settings:getField',
            GET_ALL_FIELDS: 'scenes:settings:getAllFields',
            GET_TOTAL_MEMORY: 'scenes:settings:getTotalMemory',
        },
    },
};
