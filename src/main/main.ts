import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import HotelDatabase from './database';

let db: HotelDatabase;

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
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
  } else {
    mainWindow.loadFile(path.join(__dirname, '../index.html'));
  }
}

// Database IPC handlers
ipcMain.handle('save-invoice', async (event, invoice) => {
  try {
    const result = await db.saveInvoice(invoice);
    return result;
  } catch (error) {
    console.error('Error saving invoice:', error);
    throw error;
  }
});

ipcMain.handle('get-all-invoices', async () => {
  try {
    const invoices = await db.getAllInvoices();
    return invoices;
  } catch (error) {
    console.error('Error getting invoices:', error);
    throw error;
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Initialize database
  db = new HotelDatabase();
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  // Close database connection
  if (db) {
    db.close();
  }
}); 