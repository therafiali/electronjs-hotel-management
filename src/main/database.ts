import * as path from 'path';
import * as fs from 'fs';

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
  private dbPath: string;
  private invoices: Invoice[] = [];

  constructor() {
    this.dbPath = path.join(__dirname, '../hotel-data.json');
    this.loadData();
  }

  private loadData() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, 'utf8');
        this.invoices = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.invoices = [];
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.invoices, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  saveInvoice(invoice: Invoice) {
    // Remove existing invoice with same ID if exists
    this.invoices = this.invoices.filter(inv => inv.id !== invoice.id);
    
    // Add new invoice
    this.invoices.push(invoice);
    
    // Save to file
    this.saveData();
    
    return { success: true, id: invoice.id };
  }

  getAllInvoices(): Invoice[] {
    return [...this.invoices].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  deleteInvoice(id: string) {
    this.invoices = this.invoices.filter(inv => inv.id !== id);
    this.saveData();
    return { success: true };
  }

  close() {
    // No need to close for file-based storage
  }
}

export default HotelDatabase;