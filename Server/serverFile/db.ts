import DataBase from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_DIR =
  process.env.NODE_ENV === "production" ? "/data" : __dirname;
const DB_PATH = path.join(DB_DIR, "game.db");

// production에서 디렉토리 없으면 생성
if (process.env.NODE_ENV === "production" && !fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new DataBase(DB_PATH);

db.pragma("foreign_keys = ON");

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    hp REAL DEFAULT 0,
    scoreUpdateAt INTEGER
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS ranking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    name TEXT NOT NULL,
    rank INTEGER NOT NULL,
    hp REAL NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`).run();

export default db;
