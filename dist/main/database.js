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
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class HotelDatabase {
    constructor() {
        this.data = {
            users: [],
            invoices: [],
<<<<<<< Updated upstream
            items: []
=======
            rooms: []
>>>>>>> Stashed changes
        };
        this.dbPath = path.join(__dirname, '../hotel-data.json');
        this.loadData();
        this.initializeDefaultUser();
    }
    loadData() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const fileData = fs.readFileSync(this.dbPath, 'utf8');
                const parsedData = JSON.parse(fileData);
                // Handle old format (array of invoices) vs new format (object with users, invoices, and items)
                if (Array.isArray(parsedData)) {
                    this.data = {
                        users: [],
                        invoices: parsedData,
<<<<<<< Updated upstream
                        items: []
=======
                        rooms: []
>>>>>>> Stashed changes
                    };
                }
                else {
                    this.data = {
                        users: parsedData.users || [],
                        invoices: parsedData.invoices || [],
<<<<<<< Updated upstream
                        items: parsedData.items || []
=======
                        rooms: parsedData.rooms || []
>>>>>>> Stashed changes
                    };
                }
            }
        }
        catch (error) {
            console.error('Error loading data:', error);
            this.data = {
                users: [],
                invoices: [],
<<<<<<< Updated upstream
                items: []
=======
                rooms: []
>>>>>>> Stashed changes
            };
        }
    }
    saveData() {
        try {
            fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
        }
        catch (error) {
            console.error('Error saving data:', error);
        }
    }
    initializeDefaultUser() {
        // Add default admin user if no users exist
        if (this.data.users.length === 0) {
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
            this.data.users.push(defaultUser);
            this.saveData();
            console.log('✅ Default admin user created: username=admin, password=hotel123');
        }
    }
    // Authentication methods
    authenticateUser(username, password) {
        try {
            const user = this.data.users.find(u => u.username === username &&
                u.password === password &&
                u.isActive);
            if (user) {
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
        return this.data.users.map(user => ({ ...user, password: '' })); // Don't expose passwords
    }
    // Invoice methods (updated to work with new structure)
    saveInvoice(invoice) {
        // Remove existing invoice with same ID if exists
        this.data.invoices = this.data.invoices.filter(inv => inv.id !== invoice.id);
        // Add new invoice
        this.data.invoices.push(invoice);
        // Save to file
        this.saveData();
        return { success: true, id: invoice.id };
    }
    getAllInvoices() {
        return [...this.data.invoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    deleteInvoice(id) {
        this.data.invoices = this.data.invoices.filter(inv => inv.id !== id);
        this.saveData();
        return { success: true };
    }
<<<<<<< Updated upstream
    // Item methods
    saveItem(itemData) {
        const newItem = {
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...itemData,
            createdDate: new Date().toISOString()
        };
        this.data.items.push(newItem);
        this.saveData();
        return { success: true, id: newItem.id };
    }
    getAllItems() {
        return [...this.data.items].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    }
    deleteItem(id) {
        this.data.items = this.data.items.filter(item => item.id !== id);
        this.saveData();
        return { success: true };
    }
    updateItem(id, updateData) {
        const itemIndex = this.data.items.findIndex(item => item.id === id);
        if (itemIndex === -1) {
            return { success: false };
        }
        this.data.items[itemIndex] = {
            ...this.data.items[itemIndex],
            ...updateData
        };
=======
    // Room methods
    saveRoom(room) {
        // Remove existing room with same ID if exists
        this.data.rooms = this.data.rooms.filter(r => r.id !== room.id);
        // Add new room
        this.data.rooms.push(room);
        // Save to file
        this.saveData();
        return { success: true, id: room.id };
    }
    getAllRooms() {
        return [...this.data.rooms].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    deleteRoom(id) {
        this.data.rooms = this.data.rooms.filter(r => r.id !== id);
>>>>>>> Stashed changes
        this.saveData();
        return { success: true };
    }
    close() {
        // No need to close for file-based storage
    }
}
exports.default = HotelDatabase;
