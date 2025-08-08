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
const electron_1 = require("electron");
const path = __importStar(require("path"));
const database_1 = __importDefault(require("./database"));
let db;
function createWindow() {
    // Create the browser window.
    const mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    // Load the index.html of the app.
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:3000');
        // Open the DevTools in development.
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../index.html'));
    }
}
// Authentication IPC handlers
electron_1.ipcMain.handle('authenticate-user', async (event, { username, password }) => {
    try {
        console.log(`🔐 Authentication attempt for username: ${username}`);
        const result = db.authenticateUser(username, password);
        return result;
    }
    catch (error) {
        console.error('Error during authentication:', error);
        throw error;
    }
});
electron_1.ipcMain.handle('get-all-users', async () => {
    try {
        const users = db.getAllUsers();
        return users;
    }
    catch (error) {
        console.error('Error getting users:', error);
        throw error;
    }
});
// Database IPC handlers
electron_1.ipcMain.handle('save-invoice', async (event, invoice) => {
    try {
        const result = await db.saveInvoice(invoice);
        return result;
    }
    catch (error) {
        console.error('Error saving invoice:', error);
        throw error;
    }
});
electron_1.ipcMain.handle('get-all-invoices', async () => {
    try {
        const invoices = await db.getAllInvoices();
        return invoices;
    }
    catch (error) {
        console.error('Error getting invoices:', error);
        throw error;
    }
});
// Items IPC handlers
electron_1.ipcMain.handle('save-item', async (event, itemData) => {
    try {
        const result = db.saveItem(itemData);
        return result;
    }
    catch (error) {
        console.error('Error saving item:', error);
        throw error;
    }
});
electron_1.ipcMain.handle('get-all-items', async () => {
    try {
        const items = db.getAllItems();
        return items;
    }
    catch (error) {
        console.error('Error getting items:', error);
        throw error;
    }
});
electron_1.ipcMain.handle('delete-item', async (event, itemId) => {
    try {
        const result = db.deleteItem(itemId);
        return result;
    }
    catch (error) {
        console.error('Error deleting item:', error);
        throw error;
    }
});
electron_1.ipcMain.handle('update-item', async (event, { id, updateData }) => {
    try {
        const result = db.updateItem(id, updateData);
        return result;
    }
    catch (error) {
        console.error('Error updating item:', error);
        throw error;
    }
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.whenReady().then(() => {
    // Initialize database
    db = new database_1.default();
    createWindow();
});
// Quit when all windows are closed.
electron_1.app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
electron_1.app.on('before-quit', () => {
    // Close database connection
    if (db) {
        db.close();
    }
});
