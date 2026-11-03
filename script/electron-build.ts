import { build } from "electron-builder";

import { api, window } from "../config";

await build({
    config: {
        appId: "ru.aurora.launcher",
        productName: window.title,
        electronLanguages: ["en-US"],
        publish: [
            {
                provider: "generic",
                url: new URL("/files/release", api.web).toString(),
                channel: "latest",
            },
        ],
        directories: {
            buildResources: "resources",
        },
        files: [
            "out/**/*",
            "!out/main/index.js",
            "!out/main/index-obf.js",
            "!node_modules/**/*",
            "node_modules/bytenode/**/*",
        ],
        nsis: {
            artifactName: "${productName}-Setup-${version}.${ext}",
        },
        mac: {
            category: "public.app-category.games",
        },
        linux: {
            target: ["deb", "rpm", "AppImage"],
            category: "Game",
            maintainer: "AuroraTeam <null@aurora-team.ru>",
        },
    },
})
    .then((result) => {
        console.log(JSON.stringify(result));
    })
    .catch((error) => {
        console.error(error);
    });
