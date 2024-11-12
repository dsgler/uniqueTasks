import Koa from "koa";
import bodyParser from 'koa-bodyparser';
import * as Router from "koa-router";
// import sqlite3Raw from "../node_modules/sqlite3/node_modules/.bin/";
// import { Database } from 'sqlite-async';
import {DatabaseSync} from "node:sqlite";
import * as crypto from "crypto";
import myJwt from "./jwt";

const app=new Koa();
const router = new Router();

type register_body_type={username:string,email:string,passwd:base64urlString};
type resp_type={err:string|null};
type base64urlString=string;


function validateEmail(email:string) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}
function gen_salt(){
    return Math.floor(Math.random() * 4294967296) - 2147483648;
}

function hash_with_salt(rawPasswd:string,salt:number){

}

// log url:
// 作为第一个事件，打印日志
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});

app.use(bodyParser());

router.post("/register",async (ctx,next)=>{
    let body=<register_body_type>ctx.request.body;
    if (typeof body.email!=="string" || typeof body.username!=="string" || typeof body.passwd!=="string"){
        await next();
        let resp:resp_type={err:"信息不全,body:"+body};
        ctx.response.body=JSON.stringify(resp);
        return;
    }
    if (body.email===""||body.username===""||body.passwd===""){
        await next();
        let resp:resp_type={err:"信息不能为空字符串,body:"+body};
        ctx.response.body=JSON.stringify(resp);
        return;
    }
    if (validateEmail(body.email)){
        await next();
        let resp:resp_type={err:"邮件格式错误,email:"+body.email};
        ctx.response.body=JSON.stringify(resp);
        return;
    }

    // 验证完毕，准备插入数据库
    let salt=gen_salt();
    let passwd=myJwt.createHmacSHA256(body.passwd,salt);
    try{
        const database = new DatabaseSync('./database/test.db');
        const insert = database.prepare('INSERT INTO users VALUES (NULL,?,?,?,?);');
        insert.run(body.username,body.email,passwd,salt);
        await next();
        return {err:null};
    }catch (e){
        await next();
        return {err:e};
    }
})

app.use(router.routes());
app.listen(3000);
