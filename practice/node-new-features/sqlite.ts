import {DatabaseSync} from 'node:sqlite';

// :memory: or path to route
const db = new DatabaseSync(':memory:');

const table = 'users' as const;

db.exec(`CREATE TABLE IF NOT EXISTS ${table} (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)`);

const insertUser = db.prepare(`INSERT INTO ${table} (name, age) VALUES (?, ?)`);
const selectUsers = db.prepare(`SELECT * FROM ${table}`);

insertUser.run('Bro', 30);
insertUser.run('Sis', 25);

console.log(selectUsers.all());

db.close();
