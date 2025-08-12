import React, { useState, useEffect } from "react";
import InvoiceForm from "./components/InvoiceForm";
import InvoiceList from "./components/InvoiceList";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import PDFCreator from "./components/PDFCreator";
import ItemsForm from "./components/ItemsForm";
import ItemsList from "./components/ItemsList";
import RoomForm from "./components/RoomForm";
import ActivityLogs from "./components/ActivityLogs";

// User interface
interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "staff" | "manager";
  name: string;
  isActive: boolean;
  createdDate: string;
}

// Extend the global Window interface to include our electronAPI
declare global {
  interface Window {
    electronAPI: {
      sendMessage: (message: string) => void;
      onMessage: (callback: (message: string) => void) => void;
      authenticateUser: (username: string, password: string) => Promise<any>;
      getAllUsers: () => Promise<User[]>;
      saveInvoice: (invoice: any) => Promise<any>;
      getAllInvoices: () => Promise<any[]>;
      getPDFTypes: () => Promise<any[]>;
      createPDF: (
        type: string,
        invoiceId?: string
      ) => Promise<{ success: boolean; filepath: string }>;
      saveItem: (itemData: any) => Promise<any>;
      getAllItems: () => Promise<any[]>;
      deleteItem: (itemId: string) => Promise<any>;
      updateItem: (id: string, updateData: any) => Promise<any>;
                   saveRoom: (roomData: any) => Promise<any>;
      getAllRooms: () => Promise<any[]>;
      updateRoom: (id: string, updateData: any) => Promise<any>;
      getAllActivityLogs: () => Promise<any[]>;
      addActivityLog: (logData: any) => Promise<any>;
      clearActivityLogs: () => Promise<any>;
      getInvoiceFoodItems: (invoiceId: string) => Promise<any[]>;
    };
  }
}

const App: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<
    "dashboard" | "form" | "list" | "debug" | "pdf" | "items" | "rooms" | "activityLogs"
  >("dashboard");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [debugData, setDebugData] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Listen for messages from the main process
    if (window.electronAPI) {
      window.electronAPI.onMessage((msg: string) => {
        setReceivedMessages((prev) => [...prev, msg]);
      });
      setIsConnected(true);
    }
  }, []);

  useEffect(() => {
    // Load rooms and items when component mounts
    loadRooms();
    loadItems();
  }, []);

  const handleSendMessage = () => {
    if (message.trim() && window.electronAPI) {
      window.electronAPI.sendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleInvoiceSubmit = async (invoiceData: any) => {
    try {
      setLoading(true);
      console.log("Saving invoice to database:", invoiceData);

      // Save to database
      const result = await window.electronAPI.saveInvoice(invoiceData);
      console.log("Invoice saved successfully:", result);

      // Log the activity
      await window.electronAPI.addActivityLog({
        tableName: 'invoices',
        recordId: result.id,
        action: 'CREATE',
        description: `New invoice created for ${invoiceData.guestInfo?.name || 'Guest'} with total $${invoiceData.total}`,
        userId: 'Admin'
      });

      // Refresh invoices list
      await loadInvoices();

      // Switch to list view
      setCurrentView("list");
      alert("Invoice created and saved to database successfully!");
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Error saving invoice to database!");
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceClick = (invoice: any) => {
    console.log("Invoice clicked:", invoice);
    alert(
      `Invoice ${invoice.id} details:\nGuest: ${invoice.guestInfo.name}\nTotal: $${invoice.total}`
    );
  };

  const handlePrintInvoice = async (invoiceId: string) => {
    try {
      setLoading(true);
      console.log(`🖨️ Printing invoice: ${invoiceId}`);

      const result = await window.electronAPI.createPDF("invoice", invoiceId);
      if (result.success) {
        alert(
          `✅ Invoice PDF created successfully!\nSaved to: ${result.filepath}`
        );
      } else {
        alert("❌ Failed to create invoice PDF");
      }
    } catch (error) {
      console.error("Error printing invoice:", error);
      alert("❌ Error creating invoice PDF");
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const allInvoices = await window.electronAPI.getAllInvoices();
      setInvoices(allInvoices);
      console.log("Loaded invoices from database:", allInvoices);
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDebugData = async () => {
    try {
      setLoading(true);
      console.log("Loading real data from database...");

      // Get real data from database
      const realData = await window.electronAPI.getAllInvoices();

      // Log to console for easy viewing
      console.log("🔍 Real getAllInvoices() Data:", realData);
      console.log("📊 Total invoices in database:", realData.length);
      if (realData.length > 0) {
        console.log("📋 First invoice details:", realData[0]);
      }

      setDebugData(JSON.stringify(realData, null, 2));
    } catch (error) {
      console.error("Error loading debug data:", error);
      setDebugData(
        "Error loading data from database: " + (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  // Items handlers
  const handleItemSubmit = async (itemData: any) => {
    try {
      setLoading(true);
      console.log("Saving item to database:", itemData);

      // Save to database
      const result = await window.electronAPI.saveItem(itemData);
      console.log("Item saved successfully:", result);

      // Log the activity
      await window.electronAPI.addActivityLog({
        tableName: 'items',
        recordId: result.id,
        action: 'CREATE',
        description: `New item "${itemData.name}" (${itemData.category}) created with price $${itemData.price}`,
        userId: 'Admin'
      });

      // Refresh items list
      await loadItems();

      alert("Item created and saved to database successfully!");

      // Return success to indicate form should be reset
      return { success: true };
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Error saving item to database!");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItemPrice = async (itemId: string, newPrice: number) => {
    try {
      setLoading(true);
      console.log("Updating item price:", itemId, newPrice);

      // Get current item to get old price for logging
      const currentItem = items.find(item => item.id === itemId);
      const oldPrice = currentItem ? currentItem.price : 'Unknown';

      // Update item price in database
      const result = await window.electronAPI.updateItem(itemId, { price: newPrice });
      console.log("Item price updated successfully:", result);

      // Log the activity
      await window.electronAPI.addActivityLog({
        tableName: 'items',
        recordId: itemId,
        action: 'UPDATE',
        fieldName: 'price',
        oldValue: oldPrice.toString(),
        newValue: newPrice.toString(),
        description: `Item "${currentItem?.name || itemId}" price updated from $${oldPrice} to $${newPrice}`,
        userId: 'Admin'
      });

      // Refresh items list to show updated price
      await loadItems();

      alert("Item price updated successfully!");
    } catch (error) {
      console.error("Error updating item price:", error);
      alert("Error updating item price!");
      throw error; // Re-throw to let EditButton handle the error
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoomPrice = async (roomId: string, newPrice: number) => {
    try {
      setLoading(true);
      console.log("Updating room price:", roomId, newPrice);

      // Get current room to get old price for logging
      const currentRoom = rooms.find(room => room.roomId === roomId);
      const oldPrice = currentRoom ? currentRoom.pricePerNight : 'Unknown';

      // Update room price in database
      const result = await window.electronAPI.updateRoom(roomId, { pricePerNight: newPrice });
      console.log("Room price updated successfully:", result);

      // Log the activity
      await window.electronAPI.addActivityLog({
        tableName: 'rooms',
        recordId: roomId,
        action: 'UPDATE',
        fieldName: 'price',
        oldValue: oldPrice.toString(),
        newValue: newPrice.toString(),
        description: `Room ${currentRoom?.roomNumber || roomId} price updated from $${oldPrice} to $${newPrice}`,
        userId: 'Admin'
      });

      // Refresh rooms list to show updated price
      await loadRooms();

      alert("Room price updated successfully!");
    } catch (error) {
      console.error("Error updating room price:", error);
      alert("Error updating room price!");
      throw error; // Re-throw to let EditButton handle the error
    } finally {
      setLoading(false);
    }
  };

  // Room handlers
  const handleRoomSubmit = async (roomData: any) => {
    try {
      setLoading(true);
      console.log("Saving room to database:", roomData);

      // Save to database
      const result = await window.electronAPI.saveRoom(roomData);
      console.log("Room saved successfully:", result);

      // Log the activity
      await window.electronAPI.addActivityLog({
        tableName: 'rooms',
        recordId: result.id,
        action: 'CREATE',
        description: `New room "${roomData.roomNumber}" (${roomData.roomType}) created with price $${roomData.price}`,
        userId: 'Admin'
      });

      alert("Room type created and saved to database successfully!");

      // Return success to indicate form should be reset
      return { success: true };
    } catch (error) {
      console.error("Error saving room:", error);
      alert("Error saving room to database!");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: any) => {
    console.log("Item clicked:", item);
    alert(
      `Item Details:\nName: ${item.name}\nCategory: ${
        item.category
      }\nPrice: $${item.price.toFixed(2)}`
    );
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      const allItems = await window.electronAPI.getAllItems();
      setItems(allItems);
      console.log("Loaded items from database:", allItems);
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      const allRooms = await window.electronAPI.getAllRooms();
      setRooms(allRooms);
      console.log("Loaded rooms from database:", allRooms);
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  // Authentication handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    console.log("User logged in successfully:", user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentView("dashboard");
    console.log("User logged out");
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🏨 Hotel Paradise Management System</h1>
          <div className="header-right">
            <div className="user-info">
              <span className="user-greeting">
                Welcome, <strong>{currentUser?.name}</strong>
              </span>
              <span className="user-role">({currentUser?.role})</span>
            </div>
            <button
              onClick={() => setCurrentView("pdf")}
              className="pdf-button"
              title="Create PDF Documents"
            >
              📄 PDF Creator
            </button>
            <button onClick={handleLogout} className="logout-button">
              🚪 Logout
            </button>
            <div className="status-indicator">
              <span
                className={`status-dot ${
                  isConnected ? "connected" : "disconnected"
                }`}
              ></span>
              <span className="status-text">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        {currentView === "dashboard" ? (
          <Dashboard
            onNavigateToInvoice={() => setCurrentView("form")}
            onNavigateToList={async () => {
              await loadInvoices();
              setCurrentView("list");
            }}
            onNavigateToItems={async () => {
              await loadItems();
              setCurrentView("items");
            }}
            onNavigateToRooms={async () => {
              await loadRooms();
              setCurrentView("rooms");
            }}
            onNavigateToActivityLogs={() => setCurrentView("activityLogs")}
          />
        ) : currentView === "form" ? (
          <div>
            <InvoiceForm onSubmit={handleInvoiceSubmit} rooms={rooms} items={items} />
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={async () => {
                  await loadInvoices();
                  setCurrentView("list");
                }}
                style={{
                  background: "#27ae60",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  marginRight: "10px",
                }}
              >
                View Invoice List
              </button>
              <button
                onClick={async () => {
                  setCurrentView("debug");
                  await loadDebugData();
                }}
                style={{
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Debug Data Preview
              </button>
            </div>
          </div>
        ) : currentView === "list" ? (
          <div>
            <InvoiceList
              invoices={invoices}
              onInvoiceClick={handleInvoiceClick}
              onPrintInvoice={handlePrintInvoice}
            />
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={() => setCurrentView("dashboard")}
                style={{
                  background: "#3498db",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  marginRight: "10px",
                }}
              >
                Back to Dashboard
              </button>
              <button
                onClick={async () => {
                  setCurrentView("debug");
                  await loadDebugData();
                }}
                style={{
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Debug Data Preview
              </button>
            </div>
          </div>
        ) : currentView === "pdf" ? (
          <div>
            <PDFCreator />
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={() => setCurrentView("dashboard")}
                style={{
                  background: "#3498db",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : currentView === "items" ? (
          <div>
            <ItemsForm 
              onSubmit={handleItemSubmit} 
              items={items}
              onRefreshItems={loadItems}
              onUpdateItemPrice={handleUpdateItemPrice}
            />
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={() => setCurrentView("dashboard")}
                style={{
                  background: "#3498db",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>

        ) : currentView === "rooms" ? (
          <div>
            <RoomForm 
              onSubmit={handleRoomSubmit} 
              rooms={rooms}
              onRefreshRooms={loadRooms}
              onUpdateRoomPrice={handleUpdateRoomPrice}
            />
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={() => setCurrentView("dashboard")}
                style={{
                  background: "#3498db",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : currentView === "activityLogs" ? (
          <div>
            <ActivityLogs onBackToDashboard={() => setCurrentView("dashboard")} />
          </div>

        ) : (
          <div>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h2>🔍 Real Database Data Preview</h2>
              <p>
                This shows the actual data from getAllInvoices() in your
                database
              </p>
            </div>
            {loading && (
              <div style={{ textAlign: "center", margin: "20px" }}>
                <p>Loading data from database...</p>
              </div>
            )}
            <div
              style={{
                background: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                padding: "20px",
                margin: "20px",
                maxHeight: "500px",
                overflow: "auto",
              }}
            >
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  color: "#333",
                }}
              >
                {debugData ||
                  'Click "Load Real Data" to see actual database content'}
              </pre>
            </div>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={loadDebugData}
                disabled={loading}
                style={{
                  background: "#17a2b8",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  marginRight: "10px",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Loading..." : "Load Real Data"}
              </button>
              <button
                onClick={() => setCurrentView("dashboard")}
                style={{
                  background: "#3498db",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  marginRight: "10px",
                }}
              >
                Back to Dashboard
              </button>
              <button
                onClick={async () => {
                  await loadInvoices();
                  setCurrentView("list");
                }}
                style={{
                  background: "#27ae60",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Back to List
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
