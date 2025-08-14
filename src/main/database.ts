import * as path from 'path';
import { app } from 'electron';
import Database from 'better-sqlite3';

interface InvoiceRow {
  invoiceId: string;
  guestInfo: string;
  roomInfo: string;
  foodItems: string;
  taxRate: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  date: string;
  room_id: string;
  room_price: number;
}

interface Invoice {
  invoiceId: string;
  guestInfo: unknown;
  roomInfo: unknown;
  foodItems: unknown;
  taxRate: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  date: string;
  room_id: string;
  room_price: number;
}

interface InvoiceFoodItem {
  invoiceFoodItemId: string;
  invoiceId: string;
  itemId: string;
  quantity: number;
  subtotal: number;
  priceAtTime: number;
  createdAt: string;
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

interface Item {
  id: string;
  name: string;
  item_name: string;
  category: string;
  price: number;
  createdDate: string;
}

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  price: number;
  createdDate: string;
}



class HotelDatabase {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    // Use proper Electron app paths for database location
    // In dev mode: project directory, in release: user data directory
    // 
    // Why this matters:
    // - Development: process.cwd() = project folder (where you can see the file)
    // - Release: app.getPath('userData') = app's data directory (hidden from user)
    // 
    // This ensures the database is always accessible to the app regardless of
    // where the user runs the executable from.
    if (process.env.NODE_ENV === 'development') {
      this.dbPath = path.join(process.cwd(), 'hotel.db');
    } else {
      // In production, use the user data directory
      this.dbPath = path.join(app.getPath('userData'), 'hotel.db');
    }
    
    console.log('🔍 Database path:', this.dbPath);
    console.log('🔍 Environment:', process.env.NODE_ENV || 'production');
    
    // Initialize SQLite database
    this.db = new Database(this.dbPath);
    
    // Enable foreign key constraints for data integrity
    this.db.pragma('foreign_keys = ON');
    
    this.initializeTables();
    this.initializeDefaultUser();
  }

  private initializeTables() {
    try {
      // Create users table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          email TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'manager')),
          name TEXT NOT NULL,
          isActive INTEGER NOT NULL DEFAULT 1,
          createdDate TEXT NOT NULL
        )
      `);

      // Create rooms table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS rooms (
          roomId TEXT PRIMARY KEY,
          roomNumber TEXT UNIQUE NOT NULL,
          capacity INTEGER NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('Occupied', 'Vacant', 'Maintenance', 'Reserved')),
          pricePerNight REAL NOT NULL,
          roomType TEXT NOT NULL CHECK (roomType IN ('Standard', 'Deluxe', 'Suite', 'Family')),
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `);

      // Create items table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS items (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          item_name TEXT,
          category TEXT NOT NULL,
          price REAL NOT NULL,
          createdDate TEXT NOT NULL
        )
      `);

      // Create invoices table (with new room_id and room_price columns)
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS invoices (
          invoiceId TEXT PRIMARY KEY,
          guestInfo TEXT,
          roomInfo TEXT,
          foodItems TEXT,
          taxRate REAL,
          discount REAL,
          subtotal REAL,
          tax REAL,
          total REAL,
          date TEXT,
          room_id TEXT,
          room_price REAL,
          FOREIGN KEY (room_id) REFERENCES rooms(roomId)
        )
      `);

      // Create invoiceFoodItems table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS invoiceFoodItems (
          invoiceFoodItemId TEXT PRIMARY KEY,
          invoiceId TEXT NOT NULL,
          itemId TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          subtotal REAL NOT NULL,
          priceAtTime REAL NOT NULL,
          createdAt TEXT NOT NULL,
          FOREIGN KEY (invoiceId) REFERENCES invoices(invoiceId),
          FOREIGN KEY (itemId) REFERENCES items(id)
        )
      `);

      // Create metadata table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS metadata (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);

      // Create activity_logs table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id TEXT PRIMARY KEY,
          timestamp TEXT NOT NULL,
          tableName TEXT NOT NULL,
          recordId TEXT NOT NULL,
          action TEXT NOT NULL,
          fieldName TEXT,
          oldValue TEXT,
          newValue TEXT,
          description TEXT NOT NULL,
          userId TEXT DEFAULT 'Admin',
          ipAddress TEXT,
          userAgent TEXT
        )
      `);

      console.log('✅ Database tables initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing database tables:', error);
    }
  }



  private initializeDefaultUser() {
    try {
      // Check if any users exist
      const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
      
      if (userCount.count === 0) {
        const insertUser = this.db.prepare(`
          INSERT INTO users (id, username, password, email, role, name, isActive, createdDate)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        // Create default admin user
        const defaultAdmin: User = {
          id: 'user_001',
          username: 'admin',
          password: 'hotel123', // In production, this should be hashed
          email: 'admin@hotel.com',
          role: 'admin',
          name: 'Hotel Administrator',
          isActive: true,
          createdDate: new Date().toISOString()
        };
        
        insertUser.run(
          defaultAdmin.id, defaultAdmin.username, defaultAdmin.password, defaultAdmin.email,
          defaultAdmin.role, defaultAdmin.name, defaultAdmin.isActive ? 1 : 0, defaultAdmin.createdDate
        );
        
        // Create additional user called "user"
        const defaultUser: User = {
          id: 'user_002',
          username: 'user',
          password: 'user123', // In production, this should be hashed
          email: 'user@hotel.com',
          role: 'staff',
          name: 'Hotel User',
          isActive: true,
          createdDate: new Date().toISOString()
        };
        
        insertUser.run(
          defaultUser.id, defaultUser.username, defaultUser.password, defaultUser.email,
          defaultUser.role, defaultUser.name, defaultUser.isActive ? 1 : 0, defaultUser.createdDate
        );
        
        console.log('✅ Default admin user created: username=admin, password=hotel123');
        console.log('✅ Default user created: username=user, password=user123');
      }
    } catch (error) {
      console.error('❌ Error initializing default users:', error);
    }
  }

  // Authentication methods
  authenticateUser(username: string, password: string): { success: boolean; user?: User; message: string } {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM users 
        WHERE username = ? AND password = ? AND isActive = 1
      `);
      
      const userRow = stmt.get(username, password) as any;
        console.log(userRow);
      if (userRow) {
        const user: User = {
          id: userRow.id,
          username: userRow.username,
          password: userRow.password,
          email: userRow.email,
          role: userRow.role,
          name: userRow.name,
          isActive: userRow.isActive === 1,
          createdDate: userRow.createdDate
        };

        console.log(`✅ User authenticated successfully: ${user.name} (${user.role})`);
        return {
          success: true,
          user: { ...user }, // Don't send password back
          message: 'Login successful'
        };
      } else {
        console.log(`❌ Authentication failed for username: ${username}`);
        console.log(userRow);
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
    try {
      const stmt = this.db.prepare('SELECT * FROM users');
      const userRows = stmt.all() as any[];
      
      return userRows.map(row => ({
        id: row.id,
        username: row.username,
        password: '', // Don't expose passwords
        email: row.email,
        role: row.role,
        name: row.name,
        isActive: row.isActive === 1,
        createdDate: row.createdDate
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  createUser(userData: Omit<User, 'id' | 'createdDate'>): { success: boolean; id: string; message: string } {
    try {
      // Check if username already exists
      const existingUser = this.db.prepare('SELECT id FROM users WHERE username = ?').get(userData.username);
      if (existingUser) {
        return {
          success: false,
          id: '',
          message: `Username '${userData.username}' already exists`
        };
      }

      // Create new user with generated ID
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...userData,
        createdDate: new Date().toISOString()
      };
      
      const stmt = this.db.prepare(`
        INSERT INTO users (id, username, password, email, role, name, isActive, createdDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        newUser.id,
        newUser.username,
        newUser.password,
        newUser.email,
        newUser.role,
        newUser.name,
        newUser.isActive ? 1 : 0,
        newUser.createdDate
      );
      
      console.log(`✅ User created: ${newUser.username} (${newUser.role})`);
      return {
        success: true,
        id: newUser.id,
        message: `User '${newUser.username}' created successfully`
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        id: '',
        message: 'Error creating user'
      };
    }
  }

  // Invoice methods (updated to work with SQLite)
  saveInvoice(invoice: Invoice) {
    try {
      // Start transaction for atomic operation
      const transaction = this.db.transaction(() => {
        // 1. Save main invoice record
        const invoiceStmt = this.db.prepare(`
          INSERT OR REPLACE INTO invoices 
          (invoiceId, guestInfo, roomInfo, foodItems, taxRate, discount, subtotal, tax, total, date, room_id, room_price)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        invoiceStmt.run(
          invoice.invoiceId,
          JSON.stringify(invoice.guestInfo),
          JSON.stringify(invoice.roomInfo),
          JSON.stringify(invoice.foodItems),
          invoice.taxRate,
          invoice.discount,
          invoice.subtotal,
          invoice.tax,
          invoice.total,
          invoice.date,
          invoice.room_id,
          invoice.room_price
        );

        // 2. Clear existing food items for this invoice (for updates)
        const deleteStmt = this.db.prepare('DELETE FROM invoiceFoodItems WHERE invoiceId = ?');
        deleteStmt.run(invoice.invoiceId);

        // 3. Save individual food items with foreign keys
        if (invoice.foodItems && Array.isArray(invoice.foodItems)) {
          const foodItemStmt = this.db.prepare(`
            INSERT INTO invoiceFoodItems (invoiceFoodItemId, invoiceId, itemId, quantity, subtotal, priceAtTime, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);

          invoice.foodItems.forEach((foodItem: any) => {
            // Use itemId directly from foodItem (foreign key)
            if (foodItem.itemId) {
              const invoiceFoodItemId = `invfood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              const subtotal = foodItem.quantity * foodItem.price;
              
              foodItemStmt.run(
                invoiceFoodItemId,
                invoice.invoiceId,           // Foreign key to invoices table
                foodItem.itemId,             // Foreign key to items table (direct reference)
                foodItem.quantity,
                subtotal,
                foodItem.price,              // Price at time of invoice
                new Date().toISOString()
              );
              
              console.log(`🍽️ Food item saved with foreign keys: ${foodItem.name} (itemId: ${foodItem.itemId})`);
            } else {
              // Fallback: try to find by name for backward compatibility
              const item = this.getAllItems().find(item => item.name === foodItem.name);
              
              if (item) {
                const invoiceFoodItemId = `invfood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const subtotal = foodItem.quantity * foodItem.price;
                
                foodItemStmt.run(
                  invoiceFoodItemId,
                  invoice.invoiceId,
                  item.id,
                  foodItem.quantity,
                  subtotal,
                  foodItem.price,
                  new Date().toISOString()
                );
                
                console.log(`🍽️ Food item saved (fallback): ${foodItem.name} (itemId: ${item.id})`);
              } else {
                console.warn(`⚠️ Food item not found in items table: ${foodItem.name}`);
              }
            }
          });
        }
      });

      // Execute transaction
      transaction();
      
      console.log(`✅ Invoice and food items saved with foreign keys: ${invoice.invoiceId}`);
      return { success: true, id: invoice.invoiceId };
    } catch (error) {
      console.error('Error saving invoice with food items:', error);
      return { success: false, id: invoice.invoiceId };
    }
  }

  getAllInvoices(): Invoice[] {
    try {
      // Join with rooms table to get room details via foreign key
      const stmt = this.db.prepare(`
        SELECT 
          i.*, 
          r.roomNumber as linked_roomNumber,
          r.roomType as linked_roomType,
          r.pricePerNight as linked_pricePerNight
        FROM invoices i
        LEFT JOIN rooms r ON i.room_id = r.roomId
        ORDER BY i.date DESC
      `);
      const invoiceRows = stmt.all() as any[];
      
      return invoiceRows.map(row => {
        // Build roomInfo from foreign key relationship data
        const roomInfo = {
          roomType: row.linked_roomType || '',
          roomNumber: row.linked_roomNumber || '',
          pricePerNight: row.linked_pricePerNight || row.room_price || 0,
          roomId: row.room_id  // Include room ID for compatibility
        };
        
        return {
          invoiceId: row.invoiceId,
          guestInfo: JSON.parse(row.guestInfo || '{}'),
          roomInfo: roomInfo,  // Built from foreign key data with room ID
          foodItems: JSON.parse(row.foodItems || '{}'),
          taxRate: row.taxRate,
          discount: row.discount,
          subtotal: row.subtotal,
          tax: row.tax,
          total: row.total,
          date: row.date,
          room_id: row.room_id,
          room_price: row.room_price
        };
      });
    } catch (error) {
      console.error('Error getting invoices:', error);
      return [];
    }
  }

  deleteInvoice(id: string) {
    try {
      const stmt = this.db.prepare('DELETE FROM invoices WHERE invoiceId = ?');
      const result = stmt.run(id);
      
      console.log(`✅ Invoice deleted: ${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return { success: false };
    }
  }

  // Item methods
  saveItem(itemData: Omit<Item, 'id' | 'createdDate'>): { success: boolean; id: string } {
    try {
      const newItem: Item = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...itemData,
        createdDate: new Date().toISOString()
      };
      
      const stmt = this.db.prepare(`
        INSERT INTO items (id, name, item_name, category, price, createdDate)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(newItem.id, newItem.name, newItem.item_name, newItem.category, newItem.price, newItem.createdDate);
      
      console.log(`✅ Item saved: ${newItem.id}`);
      return { success: true, id: newItem.id };
    } catch (error) {
      console.error('Error saving item:', error);
      return { success: false, id: '' };
    }
  }

  getAllItems(): Item[] {
    try {
      const stmt = this.db.prepare('SELECT * FROM items ORDER BY createdDate DESC');
      const itemRows = stmt.all() as any[];
      
      return itemRows.map(row => ({
        id: row.id,
        name: row.name,
        item_name: row.item_name || row.name,
        category: row.category,
        price: row.price,
        createdDate: row.createdDate
      }));
    } catch (error) {
      console.error('Error getting items:', error);
      return [];
    }
  }

  deleteItem(id: string): { success: boolean } {
    try {
      const stmt = this.db.prepare('DELETE FROM items WHERE id = ?');
      const result = stmt.run(id);
      
      console.log(`✅ Item deleted: ${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting item:', error);
      return { success: false };
    }
  }

  updateItem(id: string, updateData: Partial<Omit<Item, 'id' | 'createdDate'>>): { success: boolean } {
    try {
      // Build dynamic update query
      const updateFields = Object.keys(updateData).filter(key => updateData[key as keyof typeof updateData] !== undefined);
      
      if (updateFields.length === 0) {
        return { success: false };
      }
      
      const setClause = updateFields.map(field => `${field} = ?`).join(', ');
      const values = updateFields.map(field => updateData[field as keyof typeof updateData]);
      
      const stmt = this.db.prepare(`UPDATE items SET ${setClause} WHERE id = ?`);
      const result = stmt.run(...values, id);
      
      if (result.changes > 0) {
        console.log(`✅ Item updated: ${id}`);
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Error updating item:', error);
      return { success: false };
    }
  }

  // Room methods
  saveRoom(roomData: Omit<Room, 'id' | 'createdDate'>): { success: boolean; id: string } {
    try {
      const newRoom: Room = {
        id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...roomData,
        createdDate: new Date().toISOString()
      };
      
      const stmt = this.db.prepare(`
        INSERT INTO rooms (roomId, roomNumber, capacity, status, pricePerNight, roomType, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        newRoom.id, 
        newRoom.roomNumber, // Use room number from form
        2, // Default capacity
        'Vacant', // Default status
        newRoom.price, 
        newRoom.roomType, 
        newRoom.createdDate,
        newRoom.createdDate
      );
      
      console.log(`✅ Room saved: ${newRoom.id}`);
      return { success: true, id: newRoom.id };
    } catch (error) {
      console.error('Error saving room:', error);
      return { success: false, id: '' };
    }
  }

  getAllRooms(): any[] {
    try {
      const stmt = this.db.prepare('SELECT * FROM rooms ORDER BY createdAt DESC');
      const roomRows = stmt.all() as any[];
      
      return roomRows.map(row => ({
        roomId: row.roomId,           // Frontend expects roomId
        roomNumber: row.roomNumber,
        roomType: row.roomType,       // Include roomType for foreign key relationships
        pricePerNight: row.pricePerNight,  // Frontend expects pricePerNight
        createdDate: row.createdAt
      }));
    } catch (error) {
      console.error('Error getting rooms:', error);
      return [];
    }
  }

  updateRoom(id: string, updateData: Partial<Omit<Room, 'id' | 'createdDate'>>): { success: boolean } {
    try {
      // Build dynamic update query
      const updateFields = Object.keys(updateData).filter(key => updateData[key as keyof typeof updateData] !== undefined);
      
      if (updateFields.length === 0) {
        return { success: false };
      }
      
      // Map frontend field names to database column names
      const fieldMapping: { [key: string]: string } = {
        price: 'pricePerNight',
        roomNumber: 'roomNumber',
        roomType: 'roomType'
      };
      
      const setClause = updateFields.map(field => {
        const dbField = fieldMapping[field] || field;
        return `${dbField} = ?`;
      }).join(', ');
      
      const values = updateFields.map(field => updateData[field as keyof typeof updateData]);
      
      const stmt = this.db.prepare(`UPDATE rooms SET ${setClause} WHERE roomId = ?`);
      const result = stmt.run(...values, id);
      
      if (result.changes > 0) {
        console.log(`✅ Room updated: ${id}`);
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Error updating room:', error);
      return { success: false };
    }
  }

  // Activity Log methods
  getAllActivityLogs(): any[] {
    try {
      const stmt = this.db.prepare('SELECT * FROM activity_logs ORDER BY timestamp DESC');
      const logRows = stmt.all() as any[];
      
      return logRows.map(row => ({
        id: row.id,
        timestamp: row.timestamp,
        tableName: row.tableName,
        recordId: row.recordId,
        action: row.action,
        fieldName: row.fieldName,
        oldValue: row.oldValue,
        newValue: row.newValue,
        description: row.description,
        userId: row.userId,
        ipAddress: row.ipAddress,
        userAgent: row.userAgent
      }));
    } catch (error) {
      console.error('Error getting activity logs:', error);
      return [];
    }
  }

  addActivityLog(logData: {
    tableName: string;
    recordId: string;
    action: string;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    description: string;
    userId?: string;
  }): { success: boolean } {
    try {
      const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();
      
      const stmt = this.db.prepare(`
        INSERT INTO activity_logs (
          id, timestamp, tableName, recordId, action, fieldName, 
          oldValue, newValue, description, userId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        logId,
        timestamp,
        logData.tableName,
        logData.recordId,
        logData.action,
        logData.fieldName || null,
        logData.oldValue || null,
        logData.newValue || null,
        logData.description,
        logData.userId || 'Admin'
      );
      
      console.log(`✅ Activity log added: ${logData.description}`);
      return { success: true };
    } catch (error) {
      console.error('Error adding activity log:', error);
      return { success: false };
    }
  }

  clearActivityLogs(): { success: boolean } {
    try {
      const stmt = this.db.prepare('DELETE FROM activity_logs');
      const result = stmt.run();
      if (result.changes > 0) {
        console.log('✅ Activity logs cleared successfully');
        return { success: true };
      } else {
        console.log('No activity logs to clear.');
        return { success: true }; // Indicate success even if no logs
      }
    } catch (error) {
      console.error('Error clearing activity logs:', error);
      return { success: false };
    }
  }

  // Invoice Food Items methods
  saveInvoiceFoodItem(invoiceFoodItem: Omit<InvoiceFoodItem, 'invoiceFoodItemId' | 'createdAt'>): { success: boolean; id: string } {
    try {
      const newInvoiceFoodItem: InvoiceFoodItem = {
        invoiceFoodItemId: `invfood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...invoiceFoodItem,
        createdAt: new Date().toISOString()
      };
      
      const stmt = this.db.prepare(`
        INSERT INTO invoiceFoodItems (invoiceFoodItemId, invoiceId, itemId, quantity, subtotal, priceAtTime, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        newInvoiceFoodItem.invoiceFoodItemId,
        newInvoiceFoodItem.invoiceId,
        newInvoiceFoodItem.itemId,
        newInvoiceFoodItem.quantity,
        newInvoiceFoodItem.subtotal,
        newInvoiceFoodItem.priceAtTime,
        newInvoiceFoodItem.createdAt
      );
      
      console.log(`✅ Invoice food item saved: ${newInvoiceFoodItem.invoiceFoodItemId}`);
      return { success: true, id: newInvoiceFoodItem.invoiceFoodItemId };
    } catch (error) {
      console.error('Error saving invoice food item:', error);
      return { success: false, id: '' };
    }
  }

  getInvoiceFoodItems(invoiceId: string): any[] {
    try {
      // Join with items table to get item details via foreign key
      const stmt = this.db.prepare(`
        SELECT 
          ifi.*,
          i.name as itemName,
          i.category as itemCategory
        FROM invoiceFoodItems ifi
        LEFT JOIN items i ON ifi.itemId = i.id
        WHERE ifi.invoiceId = ?
        ORDER BY ifi.createdAt DESC
      `);
      const itemRows = stmt.all(invoiceId) as any[];
      
      return itemRows.map(row => ({
        invoiceFoodItemId: row.invoiceFoodItemId,
        invoiceId: row.invoiceId,
        itemId: row.itemId,
        quantity: row.quantity,
        subtotal: row.subtotal,
        priceAtTime: row.priceAtTime,
        createdAt: row.createdAt,
        // Enhanced data from foreign key relationship
        itemName: row.itemName,
        itemCategory: row.itemCategory
      }));
    } catch (error) {
      console.error('Error getting invoice food items:', error);
      return [];
    }
  }

  deleteInvoiceFoodItem(id: string): { success: boolean } {
    try {
      const stmt = this.db.prepare('DELETE FROM invoiceFoodItems WHERE invoiceFoodItemId = ?');
      const result = stmt.run(id);
      
      console.log(`✅ Invoice food item deleted: ${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting invoice food item:', error);
      return { success: false };
    }
  }

  // Metadata methods
  setMetadata(key: string, value: string): { success: boolean } {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO metadata (key, value)
        VALUES (?, ?)
      `);
      
      stmt.run(key, value);
      
      console.log(`✅ Metadata set: ${key} = ${value}`);
      return { success: true };
    } catch (error) {
      console.error('Error setting metadata:', error);
      return { success: false };
    }
  }

  getMetadata(key: string): string | null {
    try {
      const stmt = this.db.prepare('SELECT value FROM metadata WHERE key = ?');
      const result = stmt.get(key) as { value: string } | undefined;
      
      return result ? result.value : null;
    } catch (error) {
      console.error('Error getting metadata:', error);
      return null;
    }
  }

  getAllMetadata(): { [key: string]: string } {
    try {
      const stmt = this.db.prepare('SELECT key, value FROM metadata');
      const rows = stmt.all() as { key: string; value: string }[];
      
      const metadata: { [key: string]: string } = {};
      rows.forEach(row => {
        metadata[row.key] = row.value;
      });
      
      return metadata;
    } catch (error) {
      console.error('Error getting all metadata:', error);
      return {};
    }
  }

  close() {
    try {
      if (this.db) {
        this.db.close();
        console.log('✅ Database connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing database:', error);
    }
  }

  // Get the current database path
  getDatabasePath(): string {
    return this.dbPath;
  }
}

export default HotelDatabase;