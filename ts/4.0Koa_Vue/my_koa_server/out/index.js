"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa2_cors_1 = __importDefault(require("koa2-cors"));
const node_sqlite_1 = require("node:sqlite");
const jwt_1 = __importDefault(require("./jwt"));
const app = new koa_1.default();
const router = new koa_router_1.default();
// 这是一个可以暴露出去的错误
class MyErrorOut extends Error {
    constructor(message) {
        super(message);
        this.name = "MyErrorOut";
    }
}
class MyErrorInner extends Error {
    constructor(inner, outer) {
        super("这是一个内部错误");
        this.inner = inner;
        this.outer = outer;
        this.name = "MyErrorInner";
    }
}
function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}
/**
 * @describe 生成一个随机数
 * @returns {number} 在int范围内
 */
function gen_salt() {
    return Math.floor(Math.random() * 4294967296) - 2147483648;
}
function isEmptyOrNotString(...strs) {
    if (strs.length === 0) {
        throw RangeError("请至少传入一个参数");
    }
    for (let str of strs) {
        if (typeof str !== "string" && str === "") {
            return true;
        }
    }
    return false;
}
router.post("/register", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let body = ctx.request.body;
    if (isEmptyOrNotString(body.email, body.passwd, body.username)) {
        throw new MyErrorOut("输入信息错误,body:" + body);
    }
    if (!validateEmail(body.email)) {
        throw new MyErrorOut("邮箱不合法");
    }
    // 验证完毕，准备插入数据库
    let salt = gen_salt();
    // salt既是key也是盐
    let passwd = jwt_1.default.createHmacSHA256(body.passwd + salt, salt);
    try {
        const database = new node_sqlite_1.DatabaseSync("/home/dsgler/uniqueTasks/ts/4.0Koa_Vue/my_koa_server/database/test.db");
        const insert = database.prepare("INSERT INTO users VALUES (NULL,?,?,?,?);");
        insert.run(body.username, body.email, passwd, salt);
        let resp = { err: null };
        ctx.response.body = resp;
    }
    catch (e) {
        throw new MyErrorInner(e, "访问数据库错误");
    }
}));
function verify_passwd(username, rawPasswd) {
    let res;
    try {
        const database = new node_sqlite_1.DatabaseSync("/home/dsgler/uniqueTasks/ts/4.0Koa_Vue/my_koa_server/database/test.db");
        let query = database.prepare("SELECT * FROM users WHERE username=?;");
        res = query.all(username);
    }
    catch (e) {
        throw new MyErrorInner(e, "访问数据库错误");
    }
    if (res.length !== 1) {
        throw new MyErrorOut("用户不存在");
    }
    let salt = res[0].salt;
    let correct_passwd = res[0].passwd;
    let passwd = jwt_1.default.createHmacSHA256(rawPasswd + salt, salt);
    if (passwd !== correct_passwd) {
        throw new MyErrorOut("密码错误");
    }
    return salt;
}
router.post("/login", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let body = ctx.request.body;
    if (isEmptyOrNotString(body.passwd, body.username)) {
        throw new MyErrorOut("传入参数错误,body:" + body);
    }
    let salt = verify_passwd(body.username, body.passwd);
    let myJWT_instance = new jwt_1.default();
    let payload = {
        exp: Date.now() + 57600000,
        username: body.username,
    };
    let rawJWT = myJWT_instance.stringify(payload, salt);
    let resp = { err: null, rawJWT: rawJWT };
    ctx.response.body = resp;
}));
router.post("/getinfo", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let resp;
    let body = ctx.request.body;
    if (isEmptyOrNotString(body.rawJWT)) {
        throw new MyErrorOut("JWT不存在，请登录");
    }
    let JWT_instance = new jwt_1.default();
    JWT_instance.prase(body.rawJWT);
    if (JWT_instance.errCode !== 0) {
        throw new MyErrorOut(jwt_1.default.errCodeTodescription[JWT_instance.errCode]);
    }
    let res;
    try {
        const database = new node_sqlite_1.DatabaseSync("/home/dsgler/uniqueTasks/ts/4.0Koa_Vue/my_koa_server/database/test.db");
        let query = database.prepare("SELECT * FROM users WHERE username=?;");
        res = query.all(JWT_instance.payload.username);
    }
    catch (e) {
        throw new MyErrorInner(e, "数据库错误");
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
}));
router.post("/change_passwd", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let body = ctx.request.body;
    if (isEmptyOrNotString(body.newPasswd, body.oldPasswd, body.username)) {
        throw new MyErrorOut("传入信息不全,body:" + body);
    }
    verify_passwd(body.username, body.oldPasswd);
    // 验证完毕，准备插入数据库
    let salt = gen_salt();
    // salt既是key也是盐
    let passwd = jwt_1.default.createHmacSHA256(body.newPasswd + salt, salt);
    try {
        const database = new node_sqlite_1.DatabaseSync("/home/dsgler/uniqueTasks/ts/4.0Koa_Vue/my_koa_server/database/test.db");
        const insert = database.prepare("UPDATE users SET passwd=? , salt=? WHERE username=?;");
        insert.run(passwd, salt, body.username);
        ;
        let resp = { err: null };
        ctx.response.body = resp;
    }
    catch (e) {
        throw new MyErrorInner(e, "访问数据库错误");
    }
}));
function formatTime() {
    const now = new Date(); // 获取当前时间
    const hours = String(now.getHours()).padStart(2, '0'); // 获取小时数并确保是两位数
    const minutes = String(now.getMinutes()).padStart(2, '0'); // 获取分钟数并确保是两位数
    const seconds = String(now.getSeconds()).padStart(2, '0'); // 获取秒数并确保是两位数
    return `${hours}:${minutes}:${seconds}`; // 格式化为 hh:mm:ss 格式并返回
}
// log url:
// 作为第一个事件，打印日志
app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[${formatTime()}]开始处理 ${ctx.request.method} ${ctx.request.url}...`);
    let startTime = Date.now();
    yield next();
    let endTime = Date.now();
    console.log(`处理完成，用时：${endTime - startTime}ms\n`);
}));
// 解析body
app.use((0, koa_bodyparser_1.default)());
app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.response.type = "application/json";
    next();
}));
app.use((0, koa2_cors_1.default)({
    origin: "http://127.0.0.1:5173",
    allowMethods: ["GET", "POST"],
    allowHeaders: ["*"],
}));
app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield next();
    }
    catch (e) {
        if (e instanceof MyErrorInner) {
            console.log("![Inner]" + e.inner);
            ctx.response.body = { err: e.outer };
        }
        else if (e instanceof MyErrorOut) {
            console.log("[Outer]" + e.message);
            ctx.response.body = { err: e.message };
        }
        else {
            console.log(e);
            ctx.response.body = { err: "内部未知错误" };
        }
    }
}));
app.use(router.routes());
let port = 3000;
app.listen(port);
console.log("开始服务，端口：" + port);
//# sourceMappingURL=index.js.map