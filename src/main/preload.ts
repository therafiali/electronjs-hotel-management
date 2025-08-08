import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Example API methods
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  onMessage: (callback: (message: string) => void) => {
    ipcRenderer.on('message', (_, message) => callback(message));
  },
  // Database API methods
  saveInvoice: (invoice: any) => ipcRenderer.invoke('save-invoice', invoice),
  getAllInvoices: () => ipcRenderer.invoke('get-all-invoices'),
}); 