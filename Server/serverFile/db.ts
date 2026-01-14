import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR =
  process.env.NODE_ENV === "production"
    ? path.resolve("/data")
    : path.resolve(__dirname);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH =
  process.env.NODE_ENV === "production"
    ? path.join(DB_DIR, "database.sqlite")
    : path.join(DB_DIR, "database.sqlite");

const db = new Database(DB_PATH);

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
