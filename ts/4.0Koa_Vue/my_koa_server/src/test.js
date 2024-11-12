"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_sqlite_1 = require("node:sqlite");
var database = new node_sqlite_1.DatabaseSync('./database/test.db');
var query = database.prepare("SELECT * FROM users;");
var b = query.all();
console.log(b);
