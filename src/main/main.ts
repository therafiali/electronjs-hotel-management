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
ipcMain.handle('save-item', async (event, itemData) => {
  try {
    const result = db.saveItem(itemData);
    return result;
  } catch (error) {
    console.error('Error saving item:', error);
    throw error;
  }
});

ipcMain.handle('get-all-items', async () => {
  try {
    const items = db.getAllItems();
    return items;
  } catch (error) {
    console.error('Error getting items:', error);
    throw error;
  }
});

ipcMain.handle('delete-item', async (event, itemId) => {
  try {
    const result = db.deleteItem(itemId);
    return result;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
});

ipcMain.handle('update-item', async (event, { id, updateData }) => {
  try {
    const result = db.updateItem(id, updateData);
    return result;
  } catch (error) {
    console.error('Error updating item:', error);
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
