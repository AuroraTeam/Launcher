import { request } from 'undici'
import { api } from './config'
import { readFileSync, readdirSync } from 'fs'
import { basename, join } from 'path'
import { publicDecrypt, publicEncrypt } from 'crypto';

const dir = readdirSync('./dist').filter(file=>/latest(\.|-mac\.|-linux\.)yml|zip$|dmg$|AppImage$|rpm$|deb$|exe$/.exec(file))
let globalToken:Buffer

await authorization()
for (const file of dir) {
  console.log(`Skipping ${file}`)
  upload(join('./dist', file))
}

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
  const token = await body.json() as Auto
  globalToken = publicDecrypt(api.publicKey, Buffer.from(token.token, 'hex'),)
}

interface Auto {
  token:string
}