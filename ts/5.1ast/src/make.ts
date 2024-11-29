import * as acorn from "acorn";
import fs from "fs";

let str=fs.readFileSync("./src.js","utf-8")
acorn.parse(str,{locations:false,ecmaVersion:2015,})