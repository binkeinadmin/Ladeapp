import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'ladeapp.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS stations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'available' CHECK(status IN ('available', 'occupied', 'offline'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    car_plate TEXT NOT NULL,
    start_time TEXT DEFAULT (datetime('now', 'localtime')),
    end_time TEXT,
    FOREIGN KEY (station_id) REFERENCES stations(id)
  );

  CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    car_plate TEXT NOT NULL,
    phone TEXT,
    added_time TEXT DEFAULT (datetime('now', 'localtime')),
    notified INTEGER DEFAULT 0
  );
`);

// Seed initial stations if table is empty
const stationCount = (db.prepare('SELECT COUNT(*) as count FROM stations').get() as { count: number }).count;
if (stationCount === 0) {
  const insert = db.prepare('INSERT INTO stations (id, name, location, status) VALUES (?, ?, ?, ?)');
  for (let i = 1; i <= 6; i++) {
    insert.run(i, `Ladestation ${i}`, `Stellplatz ${i}`, 'available');
  }
}

export default db;
