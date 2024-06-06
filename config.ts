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
    ws: 'ws://127.0.0.1:1370/ws',
    web: 'http://127.0.0.1:1370',
    publicKey,
};

export const appPath = '.aurora-launcher';

export const discordRPC = {
    appId: '1214685301793103902',
    firstLineText: 'Тестирую лаунчер',
    secondLineText: 'Чувак, ты думал здесь что-то будет?',
    buttons: [
        {
            label: 'Прекол',
            url: 'https://youtu.be/dQw4w9WgXcQ',
        },
    ],
    largeImageKey: 'logo',
    smallImageKey: 'logo_mc',
    largeImageText: 'Aurora Launcher',
    smallImageText: 'Minecraft',
};
