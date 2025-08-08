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

interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  role: 'admin' | 'staff' | 'manager';
  name: string;
  isActive: boolean;
  createdDate: string;
}

interface DatabaseData {
  users: User[];
  invoices: Invoice[];
}

class HotelDatabase {
  private dbPath: string;
  private data: DatabaseData = {
    users: [],
    invoices: []
  };

  constructor() {
    this.dbPath = path.join(__dirname, '../hotel-data.json');
    this.loadData();
    this.initializeDefaultUser();
  }

  private loadData() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const fileData = fs.readFileSync(this.dbPath, 'utf8');
        const parsedData = JSON.parse(fileData);
        
        // Handle old format (array of invoices) vs new format (object with users and invoices)
        if (Array.isArray(parsedData)) {
          this.data = {
            users: [],
            invoices: parsedData
          };
        } else {
          this.data = {
            users: parsedData.users || [],
            invoices: parsedData.invoices || []
          };
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.data = {
        users: [],
        invoices: []
      };
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  private initializeDefaultUser() {
    // Add default admin user if no users exist
    if (this.data.users.length === 0) {
      const defaultUser: User = {
        id: 'user_001',
        username: 'admin',
        password: 'hotel123', // In production, this should be hashed
        email: 'admin@hotel.com',
        role: 'admin',
        name: 'Hotel Administrator',
        isActive: true,
        createdDate: new Date().toISOString()
      };
      
      this.data.users.push(defaultUser);
      this.saveData();
      console.log('✅ Default admin user created: username=admin, password=hotel123');
    }
  }

  // Authentication methods
  authenticateUser(username: string, password: string): { success: boolean; user?: User; message: string } {
    try {
      const user = this.data.users.find(u => 
        u.username === username && 
        u.password === password && 
        u.isActive
      );

      if (user) {
        console.log(`✅ User authenticated successfully: ${user.name} (${user.role})`);
        return {
          success: true,
          user: { ...user, password: '' }, // Don't send password back
          message: 'Login successful'
        };
      } else {
        console.log(`❌ Authentication failed for username: ${username}`);
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      return {
        success: false,
        message: 'Authentication error occurred'
      };
    }
  }

  getAllUsers(): User[] {
    return this.data.users.map(user => ({ ...user, password: '' })); // Don't expose passwords
  }

  // Invoice methods (updated to work with new structure)
  saveInvoice(invoice: Invoice) {
    // Remove existing invoice with same ID if exists
    this.data.invoices = this.data.invoices.filter(inv => inv.id !== invoice.id);
    
    // Add new invoice
    this.data.invoices.push(invoice);
    
    // Save to file
    this.saveData();
    
    return { success: true, id: invoice.id };
  }

  getAllInvoices(): Invoice[] {
    return [...this.data.invoices].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  deleteInvoice(id: string) {
    this.data.invoices = this.data.invoices.filter(inv => inv.id !== id);
    this.saveData();
    return { success: true };
  }

  close() {
    // No need to close for file-based storage
  }
}

export default HotelDatabase;