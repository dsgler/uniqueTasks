import Koa from "koa";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import cors from "koa2-cors";
import { DatabaseSync } from "node:sqlite";
import myJwt from "./jwt";
import { JWTPayloadType } from "./jwt";

const app = new Koa();
const router = new Router();

type register_body_type = {
  username: string;
  email: string;
  passwd: base64urlString;
};
type register_resp_type = { err: string | null };
type base64urlString = string;

type login_body_type = { username: string; passwd: base64urlString };
type login_resp_type = { err: string | null; rawJWT: base64urlString | null };
type query_all_type = {
  id: number;
  username: string;
  email: string;
  passwd: string;
  salt: number;
};

interface carryJWT {
  rawJWT: string;
}

type getinfo_resp_type = {
  err: string | null;
  info: { username: string; email: string } | null;
};

type change_passwd_body_type = {
  username: string;
  oldPasswd: base64urlString;
  newPasswd: base64urlString;
};

// 这是一个可以暴露出去的错误
class MyErrorOut extends Error {
  constructor(message:string) {
    super(message);
    this.name="MyErrorOut";
  }
}

class MyErrorInner extends Error {
  inner:string|Error;
  outer:string;
  constructor(inner:string|Error,outer:string) {
    super("这是一个内部错误")
    this.inner=inner;
    this.outer=outer;
    this.name="MyErrorInner";
  }
}

function validateEmail(email: string):boolean {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}
/**
 * @describe 生成一个随机数
 * @returns {number} 在int范围内
 */
function gen_salt(): number {
  return Math.floor(Math.random() * 4294967296) - 2147483648;
}

function isEmptyOrNotString(...strs:any[]):boolean{
  if (strs.length===0){
    throw RangeError("请至少传入一个参数");
  }
  for (let str of strs){
    if (typeof str!=="string" && str===""){
      return true;
    }
  }
  return false;
}

router.post("/register", async (ctx, next) => {
  let body = <register_body_type>ctx.request.body;
  if (isEmptyOrNotString(body.email,body.passwd,body.username)){
    throw new MyErrorOut("输入信息错误,body:"+body);
  }
  if (!validateEmail(body.email)) {
    throw new MyErrorOut("邮箱不合法");
  }

  // 验证完毕，准备插入数据库
  let salt = gen_salt();
  // salt既是key也是盐
  let passwd = myJwt.createHmacSHA256(body.passwd + salt, salt);
  try {
    const database = new DatabaseSync("/home/dsgler/uniqueTasks/ts/4.0Koa_Vue/my_koa_server/database/test.db");
    const insert = database.prepare("INSERT INTO users VALUES (NULL,?,?,?,?);");
    insert.run(body.username, body.email, passwd, salt);
    let resp: register_resp_type = { err: null };
    ctx.response.body = resp;
  } catch (e) {
    throw new MyErrorInner(<Error>e,"访问数据库错误");
  }
});

function verify_passwd(username:string,rawPasswd:string): number{
  let res:query_all_type[];
  try{
    const database = new DatabaseSync("/home/dsgler/uniqueTasks/ts/4.0Koa_Vue/my_koa_server/database/test.db");
    let query = database.prepare("SELECT * FROM users WHERE username=?;");
    res = <query_all_type[]>query.all(username);
  }catch(e){
    throw new MyErrorInner(<Error>e,"访问数据库错误");
  }
  if (res.length !== 1) {
    throw new MyErrorOut("用户不存在");
  }

  let salt = res[0].salt;
  let correct_passwd = res[0].passwd;
  let passwd = myJwt.createHmacSHA256(rawPasswd + salt, salt);

  if (passwd !== correct_passwd) {
    throw new MyErrorOut("密码错误");
  }

  return salt;
}

router.post("/login", async (ctx, next) => {
  let body = <login_body_type>ctx.request.body;
  if (isEmptyOrNotString(body.passwd,body.username)){
    throw new MyErrorOut("传入参数错误,body:"+body);
  }

  let salt=verify_passwd(body.username,body.passwd);

  let myJWT_instance = new myJwt();
  let payload: JWTPayloadType = {
    exp: Date.now() + 57600000,
    username: body.username,
  };
  let rawJWT = myJWT_instance.stringify(payload, salt);
  let resp: login_resp_type = { err: null, rawJWT: rawJWT };
  ctx.response.body = resp;
});

router.post("/getinfo", async (ctx, next) => {
  let resp: getinfo_resp_type;
  let body = <carryJWT>ctx.request.body;
  if (isEmptyOrNotString(body.rawJWT)) {
    throw new MyErrorOut("JWT不存在，请登录");
  }

  let JWT_instance = new myJwt();
  JWT_instance.prase(body.rawJWT);
  if (JWT_instance.errCode !== 0) {
    throw new MyErrorOut(myJwt.errCodeTodescription[<keyof typeof myJwt.errCodeTodescription>JWT_instance.errCode])
  }

  let res:query_all_type[];
  try{
    const database = new DatabaseSync("/home/dsgler/uniqueTasks/ts/4.0Koa_Vue/my_koa_server/database/test.db");
    let query = database.prepare("SELECT * FROM users WHERE username=?;");
    res = <query_all_type[]>query.all(JWT_instance.payload!.username);
  }catch(e){
    throw new MyErrorInner(<Error>e,"数据库错误");
  }
  
  if (res.length !== 1) {
    throw new MyErrorOut("用户不存在");
  }
  JWT_instance.verify(res[0].salt);
  if (!JWT_instance.isValid) {
    throw new MyErrorOut("签名验证失败");
  }

  resp = {
    err: null,
    info: { username: res[0].username, email: res[0].email },
  };
  ctx.response.body = resp;
});

router.post("/change_passwd",async (ctx,next)=>{
  let body=<change_passwd_body_type>ctx.request.body;
  if (isEmptyOrNotString(body.newPasswd,body.oldPasswd,body.username)){
    throw new MyErrorOut("传入信息不全,body:"+body);
  }

  verify_passwd(body.username,body.oldPasswd);

  // 验证完毕，准备插入数据库
  let salt = gen_salt();
  // salt既是key也是盐
  let passwd = myJwt.createHmacSHA256(body.newPasswd + salt, salt);
  try {
    const database = new DatabaseSync("/home/dsgler/uniqueTasks/ts/4.0Koa_Vue/my_koa_server/database/test.db");
    const insert = database.prepare("UPDATE users SET passwd=? , salt=? WHERE username=?;");
    insert.run(passwd,salt,body.username);;
    let resp: register_resp_type = { err: null };
    ctx.response.body = resp;
  } catch (e) {
    throw new MyErrorInner(<Error>e,"访问数据库错误");
  }

});

function formatTime() {
  const now = new Date(); // 获取当前时间
  const hours = String(now.getHours()).padStart(2, '0'); // 获取小时数并确保是两位数
  const minutes = String(now.getMinutes()).padStart(2, '0'); // 获取分钟数并确保是两位数
  const seconds = String(now.getSeconds()).padStart(2, '0'); // 获取秒数并确保是两位数

  return `${hours}:${minutes}:${seconds}`; // 格式化为 hh:mm:ss 格式并返回
}

// log url:
// 作为第一个事件，打印日志
app.use(async (ctx, next) => {
  console.log(`[${formatTime()}]开始处理 ${ctx.request.method} ${ctx.request.url}...`);
  let startTime=Date.now();
  await next();
  let endTime=Date.now();
  console.log(`处理完成，用时：${endTime-startTime}ms\n`);
});

// 解析body
app.use(bodyParser());

app.use(async (ctx, next) => {
  ctx.response.type = "application/json";
  next();
});

app.use(
  cors({
    origin: "http://127.0.0.1:5173",
    allowMethods: ["GET", "POST"],
    allowHeaders: ["*"],
  })
);

app.use(async (ctx,next)=>{
  try{
    await next();
  }catch(e){
    if (e instanceof MyErrorInner){
      console.log("![Inner]"+e.inner);
      ctx.response.body={err:e.outer};
    }else if(e instanceof MyErrorOut){
      console.log("[Outer]"+e.message);
      ctx.response.body={err:e.message};
    }else{
      console.log(e);
      ctx.response.body={err:"内部未知错误"};
    }
  }
})

app.use(router.routes());

let port=3000;
app.listen(port);
console.log("开始服务，端口："+port);
