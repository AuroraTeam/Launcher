import { request } from 'undici'
import { parse } from 'yaml'
import { api } from './config'
import { build } from './package.json';
import { readFileSync, readdirSync } from 'fs'
import { basename, join } from 'path'
import { publicDecrypt, publicEncrypt } from 'crypto';

const regex = new RegExp(`${build.publish[0].channel}(\\.|-mac\\.|-linux\\.)yml|zip$|dmg$|AppImage$|rpm$|deb$|exe$`);
const dir = readdirSync('./dist').filter(file=>regex.exec(file))
let globalToken:Buffer

if (await checkVersion()){
  await authorization()
  for (const file of dir) {
    console.log(`Uploading ${file}`)
    upload(join('./dist', file))
  }
}
console.info('Uploading versions completed!!!')

async function upload(path:string){

  const {
    statusCode,
    body
  } = await request(new URL (`/release/upload?encryptedToken=${publicEncrypt(api.publicKey, globalToken).toString("hex")}` , api.web),
    {
      method: 'POST',
      body: readFileSync(path),
      headers: ['content-disposition', basename(path), 'content-type', 'buffer']
    }
  )

  console.log('response received', statusCode)
  console.log('data', await body.text())
  if (statusCode !== 200) throw new Error('An error occurred during upload')
}

async function checkVersion():Promise<boolean> {
  let confignameYml:string
  switch(process.platform){
    case 'win32':
      confignameYml = `${build.publish[0].channel}.yml`
      break
    case 'linux':
      confignameYml = `${build.publish[0].channel}-linux.yml`
      break
    case 'darwin':
      confignameYml = `${build.publish[0].channel}-mac.yml`
      break
    default:
      throw new Error('An error occurred during check version')
  }

  const {
    statusCode,
    body
  } = await request(new URL (`/files/release/${confignameYml}`, api.web),
    {
      method: 'GET',
    }
  )

  console.log('response received', statusCode)
  const file:YamlFile = parse(await body.text())
  const localFile:YamlFile = parse(readFileSync(join('./dist', confignameYml)).toString('utf-8'))
  
  if (file.version == localFile.version) {
    console.info('The versions are identical. Upload canceled')
    return false
  }
  else {
    console.info('Version change found. Uploading a new one')
    return true
  }
}

async function authorization(){

  const {
    statusCode,
    body
  } = await request(new URL ("/release/get_token", api.web),
    {
      method: 'GET',
    }
  )

  console.log('response received', statusCode)
  const token = await body.json() as BodyAuthorization
  globalToken = publicDecrypt(api.publicKey, Buffer.from(token.token, 'hex'),)
  if (statusCode !== 200) throw new Error('An error occurred during authorization')
}

interface BodyAuthorization {
  token:string
}

interface YamlFile {
  version: string,
  files: Array<string>,
  path: string,
  sha512: string,
  releaseDate: string
}