import * as Koa from "koa";
import * as bodyParser from 'koa-bodyparser';
import * as Router from "koa-router";
import {DatabaseSync} from "node:sqlite";
import * as crypto from "crypto";
import myJwt from "./jwt";
import {JWTPayloadType} from "./jwt";

const app=new Koa();
const router = new Router();

type register_body_type={username:string,email:string,passwd:base64urlString};
type register_resp_type={err:string|null};
type base64urlString=string;

type login_body_type={username:string,passwd:base64urlString};
type login_resp_type={err:string|null,rawJWT:base64urlString|null};
type query_all_type={id:number,username:string,email:string,passwd:string,salt:number};

function validateEmail(email:string) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}
function isEmptyStr(str:string):boolean{
    return str==null || str==="";
}
/**
 * @describe 生成一个随机数
 * @returns {number} 在int范围内
 */
function gen_salt():number{
    return Math.floor(Math.random() * 4294967296) - 2147483648;
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
        let resp:register_resp_type={err:"信息不全,body:"+body};
        ctx.response.body=JSON.stringify(resp);
        return;
    }
    if (body.email===""||body.username===""||body.passwd===""){
        let resp:register_resp_type={err:"信息不能为空字符串,body:"+body};
        ctx.response.body=JSON.stringify(resp);
        return;
    }
    if (!validateEmail(body.email)){
        let resp:register_resp_type={err:"邮件格式错误,email:"+body.email};
        ctx.response.body=JSON.stringify(resp);
        return;
    }

    // 验证完毕，准备插入数据库
    let salt=gen_salt();
    // salt既是key也是盐
    let passwd=myJwt.createHmacSHA256(body.passwd+salt,salt);
    try{
        const database = new DatabaseSync('./database/test.db');
        const insert = database.prepare('INSERT INTO users VALUES (NULL,?,?,?,?);');
        insert.run(body.username,body.email,passwd,salt);
        await next();
        let resp:register_resp_type={err:null};
        ctx.response.body=JSON.stringify(resp);
        return;
    }catch (e){
        await next();
        let resp:register_resp_type={err:e};
        ctx.response.body=JSON.stringify(resp);
        return;
    }
});

router.post("/login",async (ctx,next)=>{
    let body=<login_body_type>ctx.request.body;
    if (isEmptyStr(body.passwd) || isEmptyStr(body.username)){
        let resp:login_resp_type={err:"用户名或密码不能为空",rawJWT:null};
        ctx.response.body=JSON.stringify(resp);
        return;
    }
    const database = new DatabaseSync('./database/test.db');
    let query=database.prepare("SELECT * FROM users WHERE username=?;");
    let res=<query_all_type[]>query.all(body.username);
    if (res.length!==1){
        let resp:login_resp_type={err:"用户不存在",rawJWT:null};
        ctx.response.body=JSON.stringify(resp);
        return;
    }
    let salt=res[0].salt;
    let correct_passwd=res[0].passwd;
    let passwd=myJwt.createHmacSHA256(body.passwd+salt,salt);

    if (passwd!==correct_passwd){
        let resp:login_resp_type={err:"密码错误",rawJWT:null};
        ctx.response.body=JSON.stringify(resp);
        return;
    }

    let myJWT_instance=new myJwt();
    let payload:JWTPayloadType={exp:Date.now() + 57600000,username:body.username};
    let rawJWT=myJWT_instance.stringify(payload,salt);
    let resp:login_resp_type={err:null,rawJWT:rawJWT};
    ctx.response.body=JSON.stringify(resp);
})

app.use(router.routes());
app.listen(3000);
