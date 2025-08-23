import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import HotelDatabase from "./database";
import PDFCreator from "./pdfCreator";

let db: HotelDatabase;
let pdfCreator: PDFCreator;

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the index.html of the app.
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:3000");
    // Open the DevTools in development.
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
  }
}

// Authentication IPC handlers
ipcMain.handle("authenticate-user", async (event, { username, password }) => {
  try {
    console.log(`🔐 Authentication attempt for username: ${username}`);
    const result = db.authenticateUser(username, password);
    return result;
  } catch (error) {
    console.error("Error during authentication:", error);
    throw error;
  }
});

ipcMain.handle("get-all-users", async () => {
  try {
    const users = db.getAllUsers();
    return users;
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
});

// Database IPC handlers
ipcMain.handle("save-invoice", async (event, invoice) => {
  try {
    const result = await db.saveInvoice(invoice);
    return result;
  } catch (error) {
    console.error("Error saving invoice:", error);
    throw error;
  }
});

ipcMain.handle("get-all-invoices", async () => {
  try {
    const invoices = await db.getAllInvoices();
    return invoices;
  } catch (error) {
    console.error("Error getting invoices:", error);
    throw error;
  }
});

// Database management IPC handlers
ipcMain.handle("get-database-path", async () => {
  try {
    const dbPath = db.getDatabasePath();
    return { success: true, path: dbPath };
  } catch (error) {
    console.error("Error getting database path:", error);
    throw error;
  }
});

ipcMain.handle("select-database-file", async () => {
  try {
    const { dialog } = require("electron");
    const result = await dialog.showOpenDialog({
      title: 'Select Database File',
      filters: [
        { name: 'SQLite Database', extensions: ['db'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, filePath: result.filePaths[0] };
    } else {
      return { success: false, message: 'No file selected' };
    }
  } catch (error) {
    console.error("Error selecting database file:", error);
    throw error;
  }
});

ipcMain.handle("upload-database", async (event, filePath: string) => {
  try {
    console.log(`📁 Uploading new database from: ${filePath}`);
    
    // Close current database connection
    if (db) {
      db.close();
    }
    
    // Copy the new database file to replace the current one
    const fs = require('fs');
    const currentDbPath = db.getDatabasePath();
    
    // Backup the current database (optional safety measure)
    const backupPath = currentDbPath.replace('.db', '_backup_' + Date.now() + '.db');
    if (fs.existsSync(currentDbPath)) {
      fs.copyFileSync(currentDbPath, backupPath);
      console.log(`💾 Backup created at: ${backupPath}`);
    }
    
    // Copy the new database file
    fs.copyFileSync(filePath, currentDbPath);
    console.log(`✅ Database replaced successfully from: ${filePath}`);
    
    // Reinitialize the database with the new file
    db = new HotelDatabase();
    
    return { 
      success: true, 
      message: 'Database updated successfully!',
      backupPath: backupPath
    };
  } catch (error) {
    console.error("Error uploading database:", error);
    // Try to reinitialize the database if something went wrong
    try {
      db = new HotelDatabase();
    } catch (reinitError) {
      console.error("Failed to reinitialize database:", reinitError);
    }
    throw error;
  }
});

ipcMain.handle("export-database", async () => {
  try {
    const { dialog } = require("electron");
    const fs = require('fs');
    
    // Get the current database path
    const currentDbPath = db.getDatabasePath();
    
    // Open save dialog for user to choose where to save
    const result = await dialog.showSaveDialog({
      title: 'Export Database',
      defaultPath: 'hotel.db',
      filters: [
        { name: 'SQLite Database', extensions: ['db'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (!result.canceled && result.filePath) {
      // Copy the database to the selected location
      fs.copyFileSync(currentDbPath, result.filePath);
      console.log(`📤 Database exported to: ${result.filePath}`);
      
      return { 
        success: true, 
        message: 'Database exported successfully!',
        filePath: result.filePath
      };
    } else {
      return { success: false, message: 'Export cancelled' };
    }
  } catch (error) {
    console.error("Error exporting database:", error);
    throw error;
  }
});

// PDF Creator IPC handlers
ipcMain.handle("get-pdf-types", async () => {
  try {
    const pdfTypes = pdfCreator.getAvailablePDFTypes();
    return pdfTypes;
  } catch (error) {
    console.error("Error getting PDF types:", error);
    throw error;
  }
});

ipcMain.handle("create-pdf", async (event, { type, invoiceId }) => {
  try {
    console.log(
      `📄 Creating PDF of type: ${type}${
        invoiceId ? ` for invoice: ${invoiceId}` : ""
      }`
    );
    const filepath = await pdfCreator.createPDF(type, invoiceId);
    console.log(`✅ PDF created successfully: ${filepath}`);
    return { success: true, filepath };
  } catch (error) {
    console.error("Error creating PDF:", error);
    throw error;
  }
});

// Items IPC handlers
ipcMain.handle("save-item", async (event, itemData) => {
  try {
    const result = db.saveItem(itemData);
    return result;
  } catch (error) {
    console.error("Error saving item:", error);
    throw error;
  }
});

ipcMain.handle("get-all-items", async () => {
  try {
    const items = db.getAllItems();
    return items;
  } catch (error) {
    console.error("Error getting items:", error);
    throw error;
  }
});

ipcMain.handle("delete-item", async (event, itemId) => {
  try {
    const result = db.deleteItem(itemId);
    return result;
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
});

ipcMain.handle("update-item", async (event, { id, updateData }) => {
  try {
    const result = db.updateItem(id, updateData);
    return result;
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
});

// Room IPC handlers
ipcMain.handle("save-room", async (event, roomData) => {
  try {
    const result = db.saveRoom(roomData);
    return result;
  } catch (error) {
    console.error("Error saving room:", error);
    throw error;
  }
});

ipcMain.handle("get-all-rooms", async () => {
  try {
    const rooms = db.getAllRooms();
    return rooms;
  } catch (error) {
    console.error("Error getting rooms:", error);
    throw error;
  }
});

ipcMain.handle("update-room", async (event, { id, updateData }) => {
  try {
    const result = db.updateRoom(id, updateData);
    return result;
  } catch (error) {
    console.error("Error updating room:", error);
    throw error;
  }
});

ipcMain.handle("get-all-activity-logs", async () => {
  try {
    const logs = db.getAllActivityLogs();
    return logs;
  } catch (error) {
    console.error("Error getting activity logs:", error);
    throw error;
  }
});

ipcMain.handle("add-activity-log", async (event, logData) => {
  try {
    const result = db.addActivityLog(logData);
    return result;
  } catch (error) {
    console.error("Error adding activity log:", error);
    throw error;
  }
});

ipcMain.handle("clear-activity-logs", async () => {
  try {
    const result = db.clearActivityLogs();
    return result;
  } catch (error) {
    console.error("Error clearing activity logs:", error);
    throw error;
  }
});

// File operations IPC handlers
ipcMain.handle("open-file", async (event, filepath) => {
  try {
    console.log(`📂 Opening file: ${filepath}`);
    const { shell } = require("electron");
    await shell.openPath(filepath);
    return { success: true };
  } catch (error) {
    console.error("Error opening file:", error);
    throw error;
  }
});

// Invoice Food Items IPC handlers
ipcMain.handle("get-invoice-food-items", async (event, invoiceId) => {
  try {
    const items = db.getInvoiceFoodItems(invoiceId);
    return items;
  } catch (error) {
    console.error("Error getting invoice food items:", error);
    throw error;
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Initialize database and PDF creator
  db = new HotelDatabase();
  pdfCreator = new PDFCreator();
  createWindow();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  // Close database connection
  if (db) {
    db.close();
  }
});
