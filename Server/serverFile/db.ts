import DataBase from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ES 모듈용 __dirname 정의
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB 경로 설정
const DB_DIR =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "data") // serverFile/data
    : __dirname; // 로컬 개발용은 현재 폴더

// 프로덕션이면 data 폴더가 없으면 생성
if (process.env.NODE_ENV === "production" && !fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, "game.db");

const db = new DataBase(DB_PATH);
db.pragma("foreign_keys = ON");

// users 테이블
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    hp REAL DEFAULT 0,
    scoreUpdateAt INTEGER
  )
`).run();

// ranking 테이블
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
