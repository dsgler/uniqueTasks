import * as fs from 'node:fs';
import * as crypto from 'crypto';

let pri_key=fs.readFileSync("./secret/rsa_pri");
let pub_key=fs.readFileSync("./secret/rsa_pub");

let str=crypto.privateEncrypt({key:pri_key,passphrase:""},"ds.1731388272203");
console.log(str.toString("base64url"));
let back=crypto.publicDecrypt(pub_key,str);
console.log(back.toString("utf-8"))