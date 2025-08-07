import Database from 'better-sqlite3';
import * as path from 'path';

interface InvoiceRow {
  id: string;
  guestInfo: string;
  roomInfo: string;
  foodItems: string;
  taxRate: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  date: string;
}

interface Invoice {
  id: string;
  guestInfo: unknown;
  roomInfo: unknown;
  foodItems: unknown;
  taxRate: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  date: string;
}

class HotelDatabase {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(__dirname, '../hotel.db');
    this.db = new Database(dbPath);
    this.initTables();
  }

  private initTables() {
    // Create invoices table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        guestInfo TEXT,
        roomInfo TEXT,
        foodItems TEXT,
        taxRate REAL,
        discount REAL,
        subtotal REAL,
        tax REAL,
        total REAL,
        date TEXT
      )
    `);
  }

  saveInvoice(invoice: Invoice) {
    const stmt = this.db.prepare(`
      INSERT INTO invoices (id, guestInfo, roomInfo, foodItems, taxRate, discount, subtotal, tax, total, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      invoice.id,
      JSON.stringify(invoice.guestInfo),
      JSON.stringify(invoice.roomInfo),
      JSON.stringify(invoice.foodItems),
      invoice.taxRate,
      invoice.discount,
      invoice.subtotal,
      invoice.tax,
      invoice.total,
      invoice.date
    );
  }

  getAllInvoices(): Invoice[] {
    const stmt = this.db.prepare('SELECT * FROM invoices ORDER BY date DESC');
    const rows = stmt.all() as InvoiceRow[];

    return rows.map((row) => ({
      id: row.id,
      guestInfo: JSON.parse(row.guestInfo),
      roomInfo: JSON.parse(row.roomInfo),
      foodItems: JSON.parse(row.foodItems),
      taxRate: row.taxRate,
      discount: row.discount,
      subtotal: row.subtotal,
      tax: row.tax,
      total: row.total,
      date: row.date,
    }));
  }

  deleteInvoice(id: string) {
    const stmt = this.db.prepare('DELETE FROM invoices WHERE id = ?');
    return stmt.run(id);
  }

  close() {
    this.db.close();
  }
}

export default HotelDatabase;