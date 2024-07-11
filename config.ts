import publicKey from './public.pem?raw';

export const window = {
    width: 900,
    height: 550,
    frame: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    title: 'Aurora Launcher',
};

export const api = {
    ws: 'ws://82.97.249.210:1370/ws',
    web: 'http://82.97.249.210:1370',
    publicKey,
};

export const appPath = '.aurora-launcher';

export const discordRPC = {
    appId: '1233096203395137677',
    default: {
        firstLineText: 'Тестирую лаунчер',
        secondLineText: 'Проверка',
        buttons: [
            {
                label: 'Сайт проекта',
                url: 'http://mehhost.ru',
            },
        ],
        largeImageKey: 'logo',
        smallImageKey: 'logo_mc',
        largeImageText: 'Aurora Launcher',
        smallImageText: 'Minecraft',
    },
    profile: {
        firstLineText: 'Выбираю тестируемый профиль игры',
        secondLineText: 'Загружаю {server}',
        buttons: [
            {
                label: 'Сайт проекта',
                url: 'http://mehhost.ru',
            },
        ],
        largeImageKey: 'logo',
        smallImageKey: 'logo_mc',
        largeImageText: 'Aurora Launcher',
        smallImageText: 'Minecraft',
    },
    game: {
        firstLineText: 'Играю на тестовом сервере',
        secondLineText: 'Играю за {nickname}',
        buttons: [
            {
                label: 'Сайт проекта',
                url: 'http://mehhost.ru',
            },
        ],
        largeImageKey: 'logo',
        smallImageKey: 'logo_mc',
        largeImageText: 'Aurora Launcher',
        smallImageText: 'Minecraft',
    }
};
