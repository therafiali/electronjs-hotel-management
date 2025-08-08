"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    // Example API methods
    sendMessage: (message) => electron_1.ipcRenderer.send("message", message),
    onMessage: (callback) => {
        electron_1.ipcRenderer.on("message", (_, message) => callback(message));
    },
    // Authentication API methods
    authenticateUser: (username, password) => electron_1.ipcRenderer.invoke("authenticate-user", { username, password }),
    getAllUsers: () => electron_1.ipcRenderer.invoke("get-all-users"),
    // Database API methods
    saveInvoice: (invoice) => electron_1.ipcRenderer.invoke("save-invoice", invoice),
    getAllInvoices: () => electron_1.ipcRenderer.invoke("get-all-invoices"),
    // PDF Creator API methods
    getPDFTypes: () => electron_1.ipcRenderer.invoke("get-pdf-types"),
    createPDF: (type, invoiceId) => electron_1.ipcRenderer.invoke("create-pdf", { type, invoiceId }),
    saveInvoice: (invoice) => electron_1.ipcRenderer.invoke('save-invoice', invoice),
    getAllInvoices: () => electron_1.ipcRenderer.invoke('get-all-invoices'),
    // Items API methods
    saveItem: (itemData) => electron_1.ipcRenderer.invoke('save-item', itemData),
    getAllItems: () => electron_1.ipcRenderer.invoke('get-all-items'),
    deleteItem: (itemId) => electron_1.ipcRenderer.invoke('delete-item', itemId),
    updateItem: (id, updateData) => electron_1.ipcRenderer.invoke('update-item', { id, updateData }),
});
