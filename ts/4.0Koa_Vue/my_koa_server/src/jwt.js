"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myJWT = void 0;
var crypto = require("crypto");
var myJWT = /** @class */ (function () {
    function myJWT() {
    }
    myJWT.prase = function (JWTbase64, secretKey) {
        var arr = JWTbase64.split(".");
        if (arr.length !== 3) {
            return { errCode: 100, payload: null };
        }
        var head = JSON.parse(Buffer.from(arr[0], "base64url").toString("utf-8"));
        var payload = JSON.parse(Buffer.from(arr[1], "base64url").toString("utf-8"));
        var sign = arr[2];
        if (head.alg !== myJWT.defaultHead.alg || head.typ !== myJWT.defaultHead.typ) {
            return { errCode: 101, payload: null };
        }
        var union = "".concat(arr[0], ".").concat(arr[1]);
        var genSign = myJWT.createHmacSHA256(union, secretKey);
        if (sign !== genSign) {
            return { errCode: 102, payload: null };
        }
        if (payload.exp < Date.now()) {
            return { errCode: 103, payload: null };
        }
        return { errCode: null, payload: payload };
    };
    myJWT.stringify = function (payload, secretKey) {
        var headBase64 = Buffer.from(JSON.stringify(myJWT.defaultHead), "utf-8").toString("base64url");
        var payloadBase64 = Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
        var union = "".concat(headBase64, ".").concat(payloadBase64);
        var sign = myJWT.createHmacSHA256(union, secretKey);
        return "".concat(union, ".").concat(sign);
    };
    myJWT.createHmacSHA256 = function (data, secretKey) {
        // 创建一个HMAC实例，使用SHA256算法和提供的密钥
        var buf = Buffer.alloc(4);
        buf.writeInt32BE(secretKey, 0);
        var hmac = crypto.createHmac('sha256', buf);
        // 更新数据
        hmac.update(data);
        // 计算HMAC
        var result = hmac.digest('hex');
        return result;
    };
    myJWT.defaultHead = { alg: "HS256", typ: "JWT" };
    myJWT.errCodeTodescription = {
        100: "JWT长度不为3",
        101: "JWT加密算法错误，或者不为JWT",
        102: "JWT验证错误",
        103: "已过期",
    };
    return myJWT;
}());
exports.myJWT = myJWT;
exports.default = myJWT;
var apayload = {
    exp: Date.now() + 57600000,
    email: "123@qq.com",
    username: "ds",
};
var key = 123456;
var bin = myJWT.stringify(apayload, key);
console.log(bin);
var back = myJWT.prase(bin, key);
console.log(back);
