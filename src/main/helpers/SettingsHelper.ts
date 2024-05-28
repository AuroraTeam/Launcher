import { writeFileSync, readFileSync } from 'fs';
import { JsonHelper } from '@aurora-launcher/core';
import { StorageHelper } from './StorageHelper'

export class SettingsHelper {

    static edit(type: Settings): void {
        const file = readFileSync(StorageHelper.settingsFile).toString();
        const newJson = file.replace('/(?<='+ type +': )[^,]*/', type.toString())
        console.log(newJson)
        writeFileSync(StorageHelper.settingsFile, newJson);
    }

    static check(): Settings {
        const file = readFileSync(StorageHelper.settingsFile).toString();
        const json: Settings = JsonHelper.fromJson(file);
        return json;
    }

    static create(): void {
        const defaultSettings: Settings = {
            token: '0',
            autoLogin: false,
            fullScreen: false,
            ram: 0,
            dev: false
        };
        const json = JsonHelper.toJson(defaultSettings, true);
        writeFileSync(StorageHelper.settingsFile, json, {flag: 'a'});
    }
}

export interface Settings {
    token?: string,
    autoLogin?: boolean,
    fullScreen?: boolean,
    ram?: number,
    dev?: boolean
}