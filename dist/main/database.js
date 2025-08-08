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
        this.invoices = [];
        this.dbPath = path.join(__dirname, '../hotel-data.json');
        this.loadData();
    }
    loadData() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const data = fs.readFileSync(this.dbPath, 'utf8');
                this.invoices = JSON.parse(data);
            }
        }
        catch (error) {
            console.error('Error loading data:', error);
            this.invoices = [];
        }
    }
    saveData() {
        try {
            fs.writeFileSync(this.dbPath, JSON.stringify(this.invoices, null, 2));
        }
        catch (error) {
            console.error('Error saving data:', error);
        }
    }
    saveInvoice(invoice) {
        // Remove existing invoice with same ID if exists
        this.invoices = this.invoices.filter(inv => inv.id !== invoice.id);
        // Add new invoice
        this.invoices.push(invoice);
        // Save to file
        this.saveData();
        return { success: true, id: invoice.id };
    }
    getAllInvoices() {
        return [...this.invoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    deleteInvoice(id) {
        this.invoices = this.invoices.filter(inv => inv.id !== id);
        this.saveData();
        return { success: true };
    }
    close() {
        // No need to close for file-based storage
    }
}
exports.default = HotelDatabase;
