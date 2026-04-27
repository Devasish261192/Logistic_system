import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'logistics.db');
const db = new Database(dbPath);

console.log('Dropping consignments table for final schema fix...');
db.exec('DROP TABLE IF EXISTS consignments');
console.log('Migration complete.');
db.close();
