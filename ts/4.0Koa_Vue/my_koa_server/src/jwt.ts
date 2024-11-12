import * as crypto from "crypto";
import { Buffer } from "buffer";
type JWTHeadType = { alg: string; typ: string };
export type JWTPayloadType = {
  exp: number;
  username: string;
};
type JWTPraseRetType = {
  errCode: number | null;
  payload: JWTPayloadType | null;
};
type JWTsign = string;

type base64urlString = string;

class myJWT {
  static defaultHead: JWTHeadType = { alg: "ES256", typ: "JWT" };
  static errCodeTodescription = {
    100: "JWT长度不为3",
    101: "JWT加密算法错误,或类型不对",
    102: "JWT验证错误",
    103: "已过期",
    104: "请输入rawJWT"
  };
  static createHmacSHA256(data: string, key: number): string {
    let buf = Buffer.alloc(4);
    buf.writeInt32BE(key, 0);
    let hash = crypto.createHmac("sha256", buf);
    hash.update(data);
    return hash.update(data).digest("hex");
  }
  static stringToBase64url() {}

  payload?: JWTPayloadType;
  sign: string;
  rawJWT?: string;
  rawUnion?: string;
  secretKey?: number;
  errCode: number;
  hasVerified: boolean;
  isValid?: boolean;

  constructor() {
    this.hasVerified = false;
    this.errCode = 0;
  }

  prase(rawJWT?: string): number {
    if (rawJWT != null) {
      this.rawJWT = rawJWT;
    } else {
      rawJWT = this.rawJWT;
    }

    if (rawJWT==null){
      return 105;
    }
    let arr = rawJWT!.split(".");
    if (arr.length !== 3) {
      this.errCode = 100;
      return 100;
    }
    let head: JWTHeadType = JSON.parse(
      Buffer.from(arr[0], "base64url").toString("utf-8")
    );
    let payload: JWTPayloadType = JSON.parse(
      Buffer.from(arr[1], "base64url").toString("utf-8")
    );
    this.rawUnion = `${arr[0]}.${arr[1]}`;
    this.sign = arr[2];
    this.payload = payload;

    if (
      head.alg !== myJWT.defaultHead.alg ||
      head.typ !== myJWT.defaultHead.typ
    ) {
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
  }

  // 必须在prase之后调用
  verify(secretKey?: number) {
    if (secretKey != null) {
      this.secretKey = secretKey;
    } else {
      secretKey = this.secretKey;
    }

    let genSign = myJWT.createHmacSHA256(this.rawUnion!, secretKey!);
    if (genSign === this.sign) {
      this.isValid = true;
    } else {
      this.isValid = false;
      this.errCode = 102;
    }
    this.hasVerified = true;

    return this.isValid;
  }

  stringify(payload?: JWTPayloadType, secretKey?: number): string {
    if (payload != null) {
      this.payload = payload;
    } else {
      payload = this.payload;
    }

    if (secretKey != null) {
      this.secretKey = secretKey;
    } else {
      secretKey = this.secretKey;
    }

    if (payload == null && secretKey == null) {
      throw "请输入payload和secretKey";
    }

    let headBase64 = Buffer.from(
      JSON.stringify(myJWT.defaultHead),
      "utf-8"
    ).toString("base64url");
    let payloadBase64 = Buffer.from(JSON.stringify(payload), "utf-8").toString(
      "base64url"
    );
    let union = `${headBase64}.${payloadBase64}`;
    let sign = myJWT.createHmacSHA256(union, secretKey!);

    this.rawJWT = `${union}.${sign}`;
    return this.rawJWT;
  }
}

export default myJWT;

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
