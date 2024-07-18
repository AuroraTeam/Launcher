import { request } from 'undici'
import { parse } from 'yaml'
import { api } from './config'
import { readFileSync, readdirSync } from 'fs'
import { basename, join } from 'path'
import { publicDecrypt, publicEncrypt } from 'crypto';

const dir = readdirSync('./dist').filter(file=>/latest(\.|-mac\.|-linux\.)yml|zip$|dmg$|AppImage$|rpm$|deb$|exe$/.exec(file))
let globalToken:Buffer

if (await checkVersion()){
  await authorization()
  for (const file of dir) {
    console.log(`Skipping ${file}`)
    upload(join('./dist', file))
  }
}
console.info('Uploading versions completed!!!')

async function upload(path:string){

  const {
    statusCode,
    body
  } = await request(api.web + "/release/upload?encryptedToken=" + publicEncrypt(api.publicKey, globalToken).toString("hex"),
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

  const {
    statusCode,
    body
  } = await request(api.web + "/files/release/latest.yml",
    {
      method: 'GET',
    }
  )

  console.log('response received', statusCode)
  const file:YamlFile = parse(await body.text())
  const localFile:YamlFile = parse(readFileSync('./dist/latest.yml').toString('utf-8'))
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
  } = await request(api.web + "/release/get_token",
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