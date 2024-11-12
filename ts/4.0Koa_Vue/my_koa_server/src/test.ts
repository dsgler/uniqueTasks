import {DatabaseSync} from "node:sqlite";

const database = new DatabaseSync('./database/test.db');
let query=database.prepare("SELECT * FROM users;");
let b=query.all();
console.log(b);