import { publicDecrypt, publicEncrypt } from "crypto";
import { openAsBlob, readFileSync, readdirSync } from "fs";
import { basename, join } from "path";

import { FormData, request } from "undici";
import { parse } from "yaml";

import { api } from "../config";

const regex = /(?:^latest(?:-[\w-]+)?\.yml$|\.(?:zip|dmg|AppImage|rpm|deb|exe|blockmap)$)/;
const dir = readdirSync("./dist")
    .filter((file) => regex.test(file))
    .sort((a, b) => Number(a.endsWith(".yml")) - Number(b.endsWith(".yml")));
let globalToken: Buffer;

if (await checkVersion()) {
    await authorization();
    for (const file of dir) {
        console.log(`Uploading ${file}`);
        await upload(join("./dist", file));
    }
    console.info("Uploading versions completed!!!");
}

async function upload(path: string) {
    const formData = new FormData();
    formData.set("file", await openAsBlob(path), basename(path));

    const { statusCode, body } = await request(
        new URL(
            `/release/upload?encryptedToken=${publicEncrypt(api.publicKey, globalToken).toString("hex")}`,
            api.web,
        ),
        { method: "POST", body: formData },
    );

    console.log("response received", statusCode);
    console.log("data", await body.text());
    if (statusCode !== 200) throw new Error("An error occurred during upload");
}

async function checkVersion(): Promise<boolean> {
    let confignameYml: string;
    switch (process.platform) {
        case "win32":
            confignameYml = "latest.yml";
            break;
        case "linux":
            confignameYml = "latest-linux.yml";
            break;
        case "darwin":
            confignameYml = "latest-mac.yml";
            break;
        default:
            throw new Error("An error occurred during check version");
    }

    const { statusCode, body } = await request(
        new URL(`/files/release/${confignameYml}`, api.web),
        {
            method: "GET",
        },
    );

    console.log("response received", statusCode);
    if (statusCode === 404) {
        await body.text();
        const local: YamlFile = parse(
            readFileSync(join("./dist", confignameYml)).toString("utf-8"),
        );
        if (!local || typeof local.version !== "string" || !local.version)
            throw new Error("Invalid local release metadata");
        return true;
    }
    if (statusCode === 200) {
        const file: YamlFile = parse(await body.text());
        const localFile: YamlFile = parse(
            readFileSync(join("./dist", confignameYml)).toString("utf-8"),
        );
        if (
            !file ||
            typeof file.version !== "string" ||
            !file.version ||
            !localFile ||
            typeof localFile.version !== "string" ||
            !localFile.version
        ) {
            throw new Error("Invalid release metadata");
        }
        if (file.version == localFile.version) {
            console.info("The versions are identical. Upload canceled");
            return false;
        } else {
            console.info("Version change found. Uploading a new one");
            return true;
        }
    } else {
        console.log("data", await body.text());
        throw new Error("An error occurred during check version");
    }
}

async function authorization() {
    const { statusCode, body } = await request(new URL("/release/get_token", api.web), {
        method: "GET",
    });

    console.log("response received", statusCode);
    if (statusCode !== 200) {
        await body.text();
        throw new Error(
            "It seems you are using the wrong version of LauncherServer. Please update to 0.0.5",
        );
    }
    const token = (await body.json()) as BodyAuthorization;
    try {
        globalToken = publicDecrypt(api.publicKey, Buffer.from(token.token, "hex"));
    } catch {
        throw new Error("Invalid public.pem");
    }
}

interface BodyAuthorization {
    token: string;
}

interface YamlFile {
    version: string;
    files: Array<string>;
    path: string;
    sha512: string;
    releaseDate: string;
}
