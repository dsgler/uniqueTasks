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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var koa_1 = require("koa");
var koa_bodyparser_1 = require("koa-bodyparser");
var Router = require("koa-router");
// import sqlite3Raw from "../node_modules/sqlite3/node_modules/.bin/";
// import { Database } from 'sqlite-async';
var node_sqlite_1 = require("node:sqlite");
var jwt_1 = require("./jwt");
var app = new koa_1.default();
var router = new Router();
function validateEmail(email) {
    var regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}
function gen_salt() {
    return Math.floor(Math.random() * 4294967296) - 2147483648;
}
function hash_with_salt(rawPasswd, salt) {
}
// log url:
// 作为第一个事件，打印日志
app.use(function (ctx, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Process ".concat(ctx.request.method, " ").concat(ctx.request.url, "..."));
                return [4 /*yield*/, next()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
app.use((0, koa_bodyparser_1.default)());
router.post("/register", function (ctx, next) { return __awaiter(void 0, void 0, void 0, function () {
    var body, resp, resp, resp, salt, passwd, database, insert, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = ctx.request.body;
                if (!(typeof body.email !== "string" || typeof body.username !== "string" || typeof body.passwd !== "string")) return [3 /*break*/, 2];
                return [4 /*yield*/, next()];
            case 1:
                _a.sent();
                resp = { err: "信息不全,body:" + body };
                ctx.response.body = JSON.stringify(resp);
                return [2 /*return*/];
            case 2:
                if (!(body.email === "" || body.username === "" || body.passwd === "")) return [3 /*break*/, 4];
                return [4 /*yield*/, next()];
            case 3:
                _a.sent();
                resp = { err: "信息不能为空字符串,body:" + body };
                ctx.response.body = JSON.stringify(resp);
                return [2 /*return*/];
            case 4:
                if (!validateEmail(body.email)) return [3 /*break*/, 6];
                return [4 /*yield*/, next()];
            case 5:
                _a.sent();
                resp = { err: "邮件格式错误,email:" + body.email };
                ctx.response.body = JSON.stringify(resp);
                return [2 /*return*/];
            case 6:
                salt = gen_salt();
                passwd = jwt_1.default.createHmacSHA256(body.passwd, salt);
                _a.label = 7;
            case 7:
                _a.trys.push([7, 9, , 11]);
                database = new node_sqlite_1.DatabaseSync('./database/test.db');
                insert = database.prepare('INSERT INTO users VALUES (NULL,?,?,?,?);');
                insert.run(body.username, body.email, passwd, salt);
                return [4 /*yield*/, next()];
            case 8:
                _a.sent();
                return [2 /*return*/, { err: null }];
            case 9:
                e_1 = _a.sent();
                return [4 /*yield*/, next()];
            case 10:
                _a.sent();
                return [2 /*return*/, { err: e_1 }];
            case 11: return [2 /*return*/];
        }
    });
}); });
app.use(router.routes());
app.listen(3000);
