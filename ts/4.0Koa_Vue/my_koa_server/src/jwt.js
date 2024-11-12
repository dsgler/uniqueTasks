"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
var buffer_1 = require("buffer");
var myJWT = /** @class */ (function () {
    function myJWT() {
        this.hasVerified = false;
        this.errCode = 0;
    }
    myJWT.createHmacSHA256 = function (data, key) {
        var buf = buffer_1.Buffer.alloc(4);
        buf.writeInt32BE(key, 0);
        var hash = crypto.createHmac("sha256", buf);
        hash.update(data);
        return hash.update(data).digest("hex");
    };
    myJWT.stringToBase64url = function () { };
    myJWT.prototype.prase = function (rawJWT) {
        if (rawJWT != null) {
            this.rawJWT = rawJWT;
        }
        else {
            rawJWT = this.rawJWT;
        }
        if (rawJWT == null) {
            return 105;
        }
        var arr = rawJWT.split(".");
        if (arr.length !== 3) {
            this.errCode = 100;
            return 100;
        }
        var head = JSON.parse(buffer_1.Buffer.from(arr[0], "base64url").toString("utf-8"));
        var payload = JSON.parse(buffer_1.Buffer.from(arr[1], "base64url").toString("utf-8"));
        this.rawUnion = "".concat(arr[0], ".").concat(arr[1]);
        this.sign = arr[2];
        this.payload = payload;
        if (head.alg !== myJWT.defaultHead.alg ||
            head.typ !== myJWT.defaultHead.typ) {
            this.errCode = 101;
            return 101;
        }
        // let genSign: JWTsign ;
        // if (sign !== genSign) {
        //   return { errCode: 102, payload: null };
        // }
        if (payload.exp < Date.now()) {
            this.errCode = 103;
            return 103;
        }
        return 0;
    };
    // 必须在prase之后调用
    myJWT.prototype.verify = function (secretKey) {
        if (secretKey != null) {
            this.secretKey = secretKey;
        }
        else {
            secretKey = this.secretKey;
        }
        var genSign = myJWT.createHmacSHA256(this.rawUnion, secretKey);
        if (genSign === this.sign) {
            this.isValid = true;
        }
        else {
            this.isValid = false;
            this.errCode = 102;
        }
        this.hasVerified = true;
        return this.isValid;
    };
    myJWT.prototype.stringify = function (payload, secretKey) {
        if (payload != null) {
            this.payload = payload;
        }
        else {
            payload = this.payload;
        }
        if (secretKey != null) {
            this.secretKey = secretKey;
        }
        else {
            secretKey = this.secretKey;
        }
        if (payload == null && secretKey == null) {
            throw "请输入payload和secretKey";
        }
        var headBase64 = buffer_1.Buffer.from(JSON.stringify(myJWT.defaultHead), "utf-8").toString("base64url");
        var payloadBase64 = buffer_1.Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
        var union = "".concat(headBase64, ".").concat(payloadBase64);
        var sign = myJWT.createHmacSHA256(union, secretKey);
        this.rawJWT = "".concat(union, ".").concat(sign);
        return this.rawJWT;
    };
    myJWT.defaultHead = { alg: "ES256", typ: "JWT" };
    myJWT.errCodeTodescription = {
        100: "JWT长度不为3",
        101: "JWT加密算法错误,或类型不对",
        102: "JWT验证错误",
        103: "已过期",
        104: "请输入rawJWT"
    };
    return myJWT;
}());
exports.default = myJWT;
// let apayload: JWTPayloadType = {
//   exp: Date.now() + 57600000,
//   email: "123@qq.com",
//   username: "ds",
// };
// let isn = new myJWT();
// let key = 12345;
// isn.stringify(apayload, key);
// console.log(isn.rawJWT);
// isn.payload = undefined;
// isn.prase();
// console.log(isn.payload);
// console.log(isn.verify(1));
