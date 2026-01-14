import fs from "fs";
import path from "path";
import DataBase from "better-sqlite3";

const DB_DIR = path.join(__dirname, "data"); // serverFile/data
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const DB_PATH = path.join(DB_DIR, "game.db");

const db = new DataBase(DB_PATH);
db.pragma("foreign_keys = ON");

// 테이블 생성 예시
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
