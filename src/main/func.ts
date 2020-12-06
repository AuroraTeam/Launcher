import * as path from 'path'
import * as fs from 'fs'

export function getGameArgs(gameProfile: any) {
    const auth_player_name = 'JCat';
    const version_name = gameProfile.version_name;
    const game_directory = gameProfile.game_directory;
    const assets_root = gameProfile.assets_root;
    const assets_index_name = gameProfile.assets_index_name;
    const auth_uuid = 0;
    const auth_access_token = '98c555f2-0827-47bd-8eae-854fdb775df3';
    const user_type = 'mojang';
    const version_type = 'AuroraLauncher v0.1.0';

    const gameArgs = [
        "--username",
        `${auth_player_name}`,
        "--version",
        `${version_name}`,
        "--gameDir",
        `${game_directory}`,
        "--assetsDir",
        `${assets_root}`,
        "--assetIndex",
        `${assets_index_name}`,
        "--uuid",
        `${auth_uuid}`,
        "--accessToken",
        `${auth_access_token}`,
        "--userType",
        `${user_type}`,
        "--versionType",
        `${version_type}`,
    ];

    return gameArgs;
}

export function scanDir(dir: string, link: string[] = []): string[] {
    if (fs.statSync(dir).isDirectory()) {
        for (const fdir of fs.readdirSync(dir)) {
            scanDir(path.resolve(dir, fdir), link);
        }
    } else {
        link.push(dir);
    }
    return link;
}
