import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Example API methods
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  onMessage: (callback: (message: string) => void) => {
    ipcRenderer.on('message', (_, message) => callback(message));
  },
  // Authentication API methods
  authenticateUser: (username: string, password: string) => 
    ipcRenderer.invoke('authenticate-user', { username, password }),
  getAllUsers: () => ipcRenderer.invoke('get-all-users'),
  // Database API methods
  saveInvoice: (invoice: any) => ipcRenderer.invoke('save-invoice', invoice),
  getAllInvoices: () => ipcRenderer.invoke('get-all-invoices'),
  // Items API methods
  saveItem: (itemData: any) => ipcRenderer.invoke('save-item', itemData),
  getAllItems: () => ipcRenderer.invoke('get-all-items'),
  deleteItem: (itemId: string) => ipcRenderer.invoke('delete-item', itemId),
  updateItem: (id: string, updateData: any) => ipcRenderer.invoke('update-item', { id, updateData }),
}); 