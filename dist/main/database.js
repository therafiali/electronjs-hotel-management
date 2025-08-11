"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
class HotelDatabase {
    constructor() {
        // Fix the database path to use the project root directory
        this.dbPath = path.join(process.cwd(), 'hotel.db');
        console.log('🔍 Database path:', this.dbPath);
        // Initialize SQLite database
        this.db = new better_sqlite3_1.default(this.dbPath);
        // Disable foreign key constraints to avoid conflicts
        this.db.pragma('foreign_keys = OFF');
        this.initializeTables();
        this.initializeDefaultUser();
    }
    initializeTables() {
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
            // Create invoices table
            this.db.exec(`
        CREATE TABLE IF NOT EXISTS invoices (
          id TEXT PRIMARY KEY,
          guestInfo TEXT NOT NULL,
          roomInfo TEXT NOT NULL,
          foodItems TEXT NOT NULL,
          taxRate REAL NOT NULL,
          discount REAL NOT NULL,
          subtotal REAL NOT NULL,
          tax REAL NOT NULL,
          total REAL NOT NULL,
          date TEXT NOT NULL
        )
      `);
            // Create items table
            this.db.exec(`
        CREATE TABLE IF NOT EXISTS items (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          price REAL NOT NULL,
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
        }
        catch (error) {
            console.error('❌ Error initializing database tables:', error);
        }
    }
    initializeDefaultUser() {
        try {
            // Check if any users exist
            const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
            if (userCount.count === 0) {
                const defaultUser = {
                    id: 'user_001',
                    username: 'admin',
                    password: 'hotel123', // In production, this should be hashed
                    email: 'admin@hotel.com',
                    role: 'admin',
                    name: 'Hotel Administrator',
                    isActive: true,
                    createdDate: new Date().toISOString()
                };
                const insertUser = this.db.prepare(`
          INSERT INTO users (id, username, password, email, role, name, isActive, createdDate)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
                insertUser.run(defaultUser.id, defaultUser.username, defaultUser.password, defaultUser.email, defaultUser.role, defaultUser.name, defaultUser.isActive ? 1 : 0, defaultUser.createdDate);
                console.log('✅ Default admin user created: username=admin, password=hotel123');
            }
        }
        catch (error) {
            console.error('❌ Error initializing default user:', error);
        }
    }
    // Authentication methods
    authenticateUser(username, password) {
        try {
            const stmt = this.db.prepare(`
        SELECT * FROM users 
        WHERE username = ? AND password = ? AND isActive = 1
      `);
            const userRow = stmt.get(username, password);
            if (userRow) {
                const user = {
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
                    user: { ...user, password: '' }, // Don't send password back
                    message: 'Login successful'
                };
            }
            else {
                console.log(`❌ Authentication failed for username: ${username}`);
                return {
                    success: false,
                    message: 'Invalid username or password'
                };
            }
        }
        catch (error) {
            console.error('Error during authentication:', error);
            return {
                success: false,
                message: 'Authentication error occurred'
            };
        }
    }
    getAllUsers() {
        try {
            const stmt = this.db.prepare('SELECT * FROM users');
            const userRows = stmt.all();
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
        }
        catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    }
    // Invoice methods (updated to work with SQLite)
    saveInvoice(invoice) {
        try {
            const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO invoices 
        (id, guestInfo, roomInfo, foodItems, taxRate, discount, subtotal, tax, total, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
            stmt.run(invoice.id, JSON.stringify(invoice.guestInfo), JSON.stringify(invoice.roomInfo), JSON.stringify(invoice.foodItems), invoice.taxRate, invoice.discount, invoice.subtotal, invoice.tax, invoice.total, invoice.date);
            console.log(`✅ Invoice saved: ${invoice.id}`);
            return { success: true, id: invoice.id };
        }
        catch (error) {
            console.error('Error saving invoice:', error);
            return { success: false, id: invoice.id };
        }
    }
    getAllInvoices() {
        try {
            const stmt = this.db.prepare('SELECT * FROM invoices ORDER BY date DESC');
            const invoiceRows = stmt.all();
            return invoiceRows.map(row => ({
                id: row.id,
                guestInfo: JSON.parse(row.guestInfo),
                roomInfo: JSON.parse(row.roomInfo),
                foodItems: JSON.parse(row.foodItems),
                taxRate: row.taxRate,
                discount: row.discount,
                subtotal: row.subtotal,
                tax: row.tax,
                total: row.total,
                date: row.date
            }));
        }
        catch (error) {
            console.error('Error getting invoices:', error);
            return [];
        }
    }
    deleteInvoice(id) {
        try {
            const stmt = this.db.prepare('DELETE FROM invoices WHERE id = ?');
            const result = stmt.run(id);
            console.log(`✅ Invoice deleted: ${id}`);
            return { success: true };
        }
        catch (error) {
            console.error('Error deleting invoice:', error);
            return { success: false };
        }
    }
    // Item methods
    saveItem(itemData) {
        try {
            const newItem = {
                id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                ...itemData,
                createdDate: new Date().toISOString()
            };
            const stmt = this.db.prepare(`
        INSERT INTO items (id, name, category, price, createdDate)
        VALUES (?, ?, ?, ?, ?)
      `);
            stmt.run(newItem.id, newItem.name, newItem.category, newItem.price, newItem.createdDate);
            console.log(`✅ Item saved: ${newItem.id}`);
            return { success: true, id: newItem.id };
        }
        catch (error) {
            console.error('Error saving item:', error);
            return { success: false, id: '' };
        }
    }
    getAllItems() {
        try {
            const stmt = this.db.prepare('SELECT * FROM items ORDER BY createdDate DESC');
            const itemRows = stmt.all();
            return itemRows.map(row => ({
                id: row.id,
                name: row.name,
                category: row.category,
                price: row.price,
                createdDate: row.createdDate
            }));
        }
        catch (error) {
            console.error('Error getting items:', error);
            return [];
        }
    }
    deleteItem(id) {
        try {
            const stmt = this.db.prepare('DELETE FROM items WHERE id = ?');
            const result = stmt.run(id);
            console.log(`✅ Item deleted: ${id}`);
            return { success: true };
        }
        catch (error) {
            console.error('Error deleting item:', error);
            return { success: false };
        }
    }
    updateItem(id, updateData) {
        try {
            // Build dynamic update query
            const updateFields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
            if (updateFields.length === 0) {
                return { success: false };
            }
            const setClause = updateFields.map(field => `${field} = ?`).join(', ');
            const values = updateFields.map(field => updateData[field]);
            const stmt = this.db.prepare(`UPDATE items SET ${setClause} WHERE id = ?`);
            const result = stmt.run(...values, id);
            if (result.changes > 0) {
                console.log(`✅ Item updated: ${id}`);
                return { success: true };
            }
            else {
                return { success: false };
            }
        }
        catch (error) {
            console.error('Error updating item:', error);
            return { success: false };
        }
    }
    // Room methods
    saveRoom(roomData) {
        try {
            const newRoom = {
                id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                ...roomData,
                createdDate: new Date().toISOString()
            };
            const stmt = this.db.prepare(`
        INSERT INTO rooms (roomId, roomNumber, capacity, status, pricePerNight, roomType, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
            stmt.run(newRoom.id, newRoom.roomNumber, // Use room number from form
            2, // Default capacity
            'Vacant', // Default status
            newRoom.price, newRoom.roomType, newRoom.createdDate, newRoom.createdDate);
            console.log(`✅ Room saved: ${newRoom.id}`);
            return { success: true, id: newRoom.id };
        }
        catch (error) {
            console.error('Error saving room:', error);
            return { success: false, id: '' };
        }
    }
    getAllRooms() {
        try {
            const stmt = this.db.prepare('SELECT * FROM rooms ORDER BY createdAt DESC');
            const roomRows = stmt.all();
            return roomRows.map(row => ({
                id: row.roomId,
                roomNumber: row.roomNumber,
                roomType: row.roomType,
                price: row.pricePerNight,
                createdDate: row.createdAt
            }));
        }
        catch (error) {
            console.error('Error getting rooms:', error);
            return [];
        }
    }
    updateRoom(id, updateData) {
        try {
            // Build dynamic update query
            const updateFields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
            if (updateFields.length === 0) {
                return { success: false };
            }
            // Map frontend field names to database column names
            const fieldMapping = {
                price: 'pricePerNight',
                roomNumber: 'roomNumber',
                roomType: 'roomType'
            };
            const setClause = updateFields.map(field => {
                const dbField = fieldMapping[field] || field;
                return `${dbField} = ?`;
            }).join(', ');
            const values = updateFields.map(field => updateData[field]);
            const stmt = this.db.prepare(`UPDATE rooms SET ${setClause} WHERE roomId = ?`);
            const result = stmt.run(...values, id);
            if (result.changes > 0) {
                console.log(`✅ Room updated: ${id}`);
                return { success: true };
            }
            else {
                return { success: false };
            }
        }
        catch (error) {
            console.error('Error updating room:', error);
            return { success: false };
        }
    }
    // Activity Log methods
    getAllActivityLogs() {
        try {
            const stmt = this.db.prepare('SELECT * FROM activity_logs ORDER BY timestamp DESC');
            const logRows = stmt.all();
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
        }
        catch (error) {
            console.error('Error getting activity logs:', error);
            return [];
        }
    }
    addActivityLog(logData) {
        try {
            const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const timestamp = new Date().toISOString();
            const stmt = this.db.prepare(`
        INSERT INTO activity_logs (
          id, timestamp, tableName, recordId, action, fieldName, 
          oldValue, newValue, description, userId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
            stmt.run(logId, timestamp, logData.tableName, logData.recordId, logData.action, logData.fieldName || null, logData.oldValue || null, logData.newValue || null, logData.description, logData.userId || 'Admin');
            console.log(`✅ Activity log added: ${logData.description}`);
            return { success: true };
        }
        catch (error) {
            console.error('Error adding activity log:', error);
            return { success: false };
        }
    }
    clearActivityLogs() {
        try {
            const stmt = this.db.prepare('DELETE FROM activity_logs');
            const result = stmt.run();
            if (result.changes > 0) {
                console.log('✅ Activity logs cleared successfully');
                return { success: true };
            }
            else {
                console.log('No activity logs to clear.');
                return { success: true }; // Indicate success even if no logs
            }
        }
        catch (error) {
            console.error('Error clearing activity logs:', error);
            return { success: false };
        }
    }
    close() {
        try {
            if (this.db) {
                this.db.close();
                console.log('✅ Database connection closed');
            }
        }
        catch (error) {
            console.error('❌ Error closing database:', error);
        }
    }
}
exports.default = HotelDatabase;
