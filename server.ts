import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import fs from 'fs';
import https from 'https';
import { ensureCerts } from './generate-certs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'logistics.db');
const db = new Database(dbPath);

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  );
`);

// db.exec(`DROP TABLE IF EXISTS consignments`);
db.exec(`
    CREATE TABLE IF NOT EXISTS consignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      truck_number TEXT,
      lr_no TEXT UNIQUE,
      consigner_name TEXT,
      consigner_address TEXT,
      consignee_name TEXT,
      consignee_address TEXT,
      issuing_office_address TEXT,
      invoice_number TEXT,
      invoice_date TEXT,
      gst_payable_by TEXT,
      from_location TEXT,
      to_location TEXT,
      payment_type TEXT,
      billed_at TEXT,
      package_qty INTEGER,
      description TEXT,
      delivery_address TEXT,
      status TEXT,
      supervisor_id INTEGER,
      driver_id INTEGER,
      initial_slip_url TEXT,
      delivered_slip_url TEXT,
      -- Weight & Valuation (mirrors physical bill)
      weight_a REAL DEFAULT 0,
      weight_c REAL DEFAULT 0,
      dec_value REAL DEFAULT 0,
      e_way_bill TEXT DEFAULT '',
      rate REAL DEFAULT 0,
      consignor_gst TEXT DEFAULT '',
      consignee_gst TEXT DEFAULT '',
      -- Freight charges (mirrors physical bill column order)
      hamali REAL DEFAULT 0,
      rc REAL DEFAULT 0,
      sc REAL DEFAULT 0,
      st REAL DEFAULT 0,
      cpc REAL DEFAULT 0,
      fov REAL DEFAULT 0,
      dc_dd REAL DEFAULT 0,
      mis_ch REAL DEFAULT 0,
      gst_edu REAL DEFAULT 0,
      remark TEXT DEFAULT '',
      value_rs REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);


db.exec(`
  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT,
    status TEXT,
    marked_by_id INTEGER
  );

  CREATE TABLE IF NOT EXISTS maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    truck_number TEXT,
    details TEXT,
    cost REAL,
    date TEXT,
    proof_url TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consignment_id INTEGER,
    amount REAL,
    status TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS fuel_refills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER,
    truck_number TEXT,
    amount REAL,
    cost REAL,
    receipt_url TEXT,
    date TEXT
  );
`);

// Safe column migrations for existing databases
try { db.exec(`ALTER TABLE maintenance ADD COLUMN proof_url TEXT DEFAULT ''`); } catch {}

// Seed initial users if empty
const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
  insertUser.run('admin', 'admin123', 'super_admin');
  insertUser.run('sup1', 'sup123', 'supervisor');
  insertUser.run('driver1', 'driver123', 'driver');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT id, username, role FROM users WHERE username = ? AND password = ?').get(username, password) as any;
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  // Session revalidation — client calls this on page load with stored user id
  app.get('/api/me', (req, res) => {
    const id = parseInt(req.query.id as string);
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const user = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(id) as any;
    if (user) res.json(user);
    else res.status(404).json({ error: 'Not found' });
  });

  app.get('/api/users', (req, res) => {
    const users = db.prepare('SELECT id, username, role FROM users').all();
    res.json(users);
  });

  app.post('/api/users', (req, res) => {
    const { username, password, role } = req.body;
    try {
      const info = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, password, role);
      res.json({ id: info.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    // Prevent deleting the last super_admin
    const target = db.prepare('SELECT role FROM users WHERE id = ?').get(id) as any;
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.role === 'super_admin') {
      const adminCount = (db.prepare("SELECT count(*) as c FROM users WHERE role = 'super_admin'").get() as any).c;
      if (adminCount <= 1) return res.status(400).json({ error: 'Cannot delete the last super admin' });
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ success: true });
  });

  app.get('/api/consignments', (req, res) => {
    const consignments = db.prepare('SELECT * FROM consignments ORDER BY created_at DESC').all();
    res.json(consignments);
  });

  app.post('/api/consignments', (req, res) => {
    const { 
      truck_number, lr_no, consigner_name, consigner_address, consignee_name, 
      consignee_address, issuing_office_address, invoice_number, invoice_date, 
      gst_payable_by, from_location, to_location, payment_type, billed_at, 
      package_qty, description, delivery_address, supervisor_id, initial_slip_url, driver_id,
      weight_a, weight_c, dec_value, e_way_bill, rate, consignor_gst, consignee_gst,
      hamali, rc, sc, st, cpc, fov, dc_dd, mis_ch, gst_edu, remark, value_rs
    } = req.body;
    
    try {
      const info = db.prepare(`
        INSERT INTO consignments (
          truck_number, lr_no, consigner_name, consigner_address, consignee_name, 
          consignee_address, issuing_office_address, invoice_number, invoice_date, 
          gst_payable_by, from_location, to_location, payment_type, billed_at, 
          package_qty, description, delivery_address, status, supervisor_id, initial_slip_url, driver_id,
          weight_a, weight_c, dec_value, e_way_bill, rate, consignor_gst, consignee_gst,
          hamali, rc, sc, st, cpc, fov, dc_dd, mis_ch, gst_edu, remark, value_rs
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        truck_number, lr_no, consigner_name, consigner_address, consignee_name, 
        consignee_address, issuing_office_address, invoice_number, invoice_date, 
        gst_payable_by, from_location, to_location, payment_type, billed_at, 
        package_qty, description, delivery_address, 'loaded', supervisor_id, initial_slip_url, driver_id,
        weight_a, weight_c, dec_value, e_way_bill, rate, consignor_gst, consignee_gst,
        hamali, rc, sc, st, cpc, fov, dc_dd, mis_ch, gst_edu, remark, value_rs
      );
      res.json({ id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/consignments/:id', (req, res) => {
    const { id } = req.params;
    const { 
      truck_number, lr_no, consigner_name, consigner_address, consignee_name, 
      consignee_address, issuing_office_address, invoice_number, invoice_date, 
      gst_payable_by, from_location, to_location, payment_type, billed_at, 
      package_qty, description, delivery_address, status, driver_id, 
      initial_slip_url, delivered_slip_url, weight_a, weight_c, dec_value, 
      e_way_bill, rate, consignor_gst, consignee_gst, hamali, rc, sc, st, 
      cpc, fov, dc_dd, mis_ch, gst_edu, remark, value_rs
    } = req.body;
    
    const updates = [];
    const params = [];

    const fields = {
      truck_number, lr_no, consigner_name, consigner_address, consignee_name, 
      consignee_address, issuing_office_address, invoice_number, invoice_date, 
      gst_payable_by, from_location, to_location, payment_type, billed_at, 
      package_qty, description, delivery_address, status, driver_id, 
      initial_slip_url, delivered_slip_url, weight_a, weight_c, dec_value, 
      e_way_bill, rate, consignor_gst, consignee_gst, hamali, rc, sc, st, 
      cpc, fov, dc_dd, mis_ch, gst_edu, remark, value_rs
    };

    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    db.prepare(`UPDATE consignments SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    res.json({ success: true });
  });

  app.get('/api/attendance', (req, res) => {
    const attendance = db.prepare('SELECT a.*, u.username FROM attendance a JOIN users u ON a.user_id = u.id').all();
    res.json(attendance);
  });

  app.post('/api/attendance', (req, res) => {
    const { user_id, date, status, marked_by_id } = req.body;
    // Check if entry exists for this user and date
    const existing = db.prepare('SELECT id FROM attendance WHERE user_id = ? AND date = ?').get(user_id, date) as any;
    if (existing) {
      db.prepare('UPDATE attendance SET status = ?, marked_by_id = ? WHERE id = ?').run(status, marked_by_id, existing.id);
      res.json({ id: existing.id, updated: true });
    } else {
      const info = db.prepare('INSERT INTO attendance (user_id, date, status, marked_by_id) VALUES (?, ?, ?, ?)').run(user_id, date, status, marked_by_id);
      res.json({ id: info.lastInsertRowid });
    }
  });

  app.post('/api/attendance/bulk', (req, res) => {
    const { date, records, marked_by_id } = req.body; // records: [{ user_id, status }]
    const insertOrUpdate = db.transaction((data) => {
      for (const rec of data) {
        const existing = db.prepare('SELECT id FROM attendance WHERE user_id = ? AND date = ?').get(rec.user_id, date) as any;
        if (existing) {
          db.prepare('UPDATE attendance SET status = ?, marked_by_id = ? WHERE id = ?').run(rec.status, marked_by_id, existing.id);
        } else {
          db.prepare('INSERT INTO attendance (user_id, date, status, marked_by_id) VALUES (?, ?, ?, ?)').run(rec.user_id, date, rec.status, marked_by_id);
        }
      }
    });
    insertOrUpdate(records);
    res.json({ success: true });
  });

  app.get('/api/maintenance', (req, res) => {
    const maintenance = db.prepare('SELECT * FROM maintenance').all();
    res.json(maintenance);
  });

  app.post('/api/maintenance', (req, res) => {
    const { truck_number, details, cost, date, proof_url } = req.body;
    const info = db.prepare('INSERT INTO maintenance (truck_number, details, cost, date, proof_url) VALUES (?, ?, ?, ?, ?)').run(truck_number, details, cost, date, proof_url || '');
    res.json({ id: info.lastInsertRowid });
  });

  app.patch('/api/maintenance/:id', (req, res) => {
    const { id } = req.params;
    const { truck_number, details, cost, date, proof_url } = req.body;
    const updates = [];
    const params = [];
    const fields = { truck_number, details, cost, date, proof_url };
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });
    params.push(id);
    db.prepare(`UPDATE maintenance SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    res.json({ success: true });
  });

  app.get('/api/payments', (req, res) => {
    const payments = db.prepare('SELECT p.*, c.truck_number FROM payments p JOIN consignments c ON p.consignment_id = c.id').all();
    res.json(payments);
  });

  app.post('/api/payments', (req, res) => {
    const { consignment_id, amount, status, date } = req.body;
    const info = db.prepare('INSERT INTO payments (consignment_id, amount, status, date) VALUES (?, ?, ?, ?)').run(consignment_id, amount, status, date);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch('/api/payments/:id', (req, res) => {
    const { id } = req.params;
    const { consignment_id, amount, status, date } = req.body;
    const updates = [];
    const params = [];
    const fields = { consignment_id, amount, status, date };
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });
    params.push(id);
    db.prepare(`UPDATE payments SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    res.json({ success: true });
  });

  app.get('/api/fuel', (req, res) => {
    const fuel = db.prepare('SELECT f.*, u.username FROM fuel_refills f JOIN users u ON f.driver_id = u.id').all();
    res.json(fuel);
  });

  app.post('/api/fuel', (req, res) => {
    const { driver_id, truck_number, amount, cost, receipt_url, date } = req.body;
    const info = db.prepare('INSERT INTO fuel_refills (driver_id, truck_number, amount, cost, receipt_url, date) VALUES (?, ?, ?, ?, ?, ?)').run(driver_id, truck_number, amount, cost, receipt_url, date);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch('/api/fuel/:id', (req, res) => {
    const { id } = req.params;
    const { driver_id, truck_number, amount, cost, receipt_url, date } = req.body;
    const updates = [];
    const params = [];
    const fields = { driver_id, truck_number, amount, cost, receipt_url, date };
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });
    params.push(id);
    db.prepare(`UPDATE fuel_refills SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    res.json({ success: true });
  });

  // Analytics
  app.get('/api/analytics', (req, res) => {
    const totalConsignments = db.prepare('SELECT count(*) as count FROM consignments').get() as any;
    const totalMaintenance = db.prepare('SELECT sum(cost) as total FROM maintenance').get() as any;
    const totalFuel = db.prepare('SELECT sum(cost) as total FROM fuel_refills').get() as any;
    const totalPayments = db.prepare('SELECT sum(amount) as total FROM payments').get() as any;
    
    res.json({
      totalConsignments: totalConsignments.count,
      totalMaintenance: totalMaintenance.total || 0,
      totalFuel: totalFuel.total || 0,
      totalPayments: totalPayments.total || 0
    });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const pems = await ensureCerts();

  https.createServer(pems, app).listen(3000, '0.0.0.0', () => {
    console.log('\x1b[32m%s\x1b[0m', 'âœ“ LogiTrack ERP is running securely!');
    console.log('  > Local:   https://localhost:3000');
    console.log('  > Network: https://192.168.1.42:3000');
    console.log('\n  (Note: You will see a security warning on your phone. Click "Advanced" then "Proceed" to continue.)');
  });
}

startServer();
