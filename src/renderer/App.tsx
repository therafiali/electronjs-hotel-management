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
import ReportDashboard from "./components/ReportDashboard";
import AdminChartsSection from "./components/AdminChartsSection";

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
      openFile: (filepath: string) => Promise<{ success: boolean }>;
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
    "dashboard" | "form" | "list" | "debug" | "pdf" | "items" | "rooms" | "activityLogs" | "reports"
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
    loadInvoices(); // Load invoices for dashboard stats
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
        description: `New invoice created for ${invoiceData.guestInfo?.name || 'Guest'} with total Rs. ${invoiceData.total}`,
        userId: 'Admin'
      });

      // Refresh invoices list
      await loadInvoices();

      // Switch to list view
      setCurrentView("list");
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Error saving invoice to database!");
    } finally {
      setLoading(false);
    }
  };

      const handleInvoiceClick = (invoice: any) => {
      console.log("Invoice clicked:", invoice);
    };

  const handlePrintInvoice = async (invoiceId: string) => {
    try {
      setLoading(true);
      console.log(`🖨️ Printing invoice: ${invoiceId}`);

      const result = await window.electronAPI.createPDF("invoice", invoiceId);
      if (result.success) {
        // Open the PDF file after creation
        await window.electronAPI.openFile(result.filepath);
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
        description: `New item "${itemData.name}" (${itemData.category}) created with price Rs. ${itemData.price}`,
        userId: 'Admin'
      });

      // Refresh items list
      await loadItems();

      // Return success to indicate form should be reset
      return { success: true };
    } catch (error) {
      console.error("Error saving item:", error);
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
        description: `Item "${currentItem?.name || itemId}" price updated from Rs. ${oldPrice} to Rs. ${newPrice}`,
        userId: 'Admin'
      });

      // Refresh items list to show updated price
      await loadItems();

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
        description: `Room ${currentRoom?.roomNumber || roomId} price updated from Rs. ${oldPrice} to Rs. ${newPrice}`,
        userId: 'Admin'
      });

      // Refresh rooms list to show updated price
      await loadRooms();

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
        description: `New room "${roomData.roomNumber}" (${roomData.roomType}) created with price Rs. ${roomData.price}`,
        userId: 'Admin'
      });

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
        }\nPrice: Rs. ${item.price.toFixed(2)}`
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
      <Dashboard
        onNavigateToDashboard={() => setCurrentView("dashboard")}
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
        onNavigateToReports={() => setCurrentView("reports")}
        onLogout={handleLogout}
        currentUser={currentUser!}
      />
      
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: '280px',
        right: 0,
        height: '80px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '26px',
            color: '#111827',
            fontWeight: '700',
            letterSpacing: '-0.025em'
          }}>
             Rama Resort Management System
          </h1>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          {/* User Profile Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '16px',
              boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
            }}>
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#111827',
                lineHeight: '1.2'
              }}>
                Welcome, {currentUser?.name || 'User'}
              </div>
              <div style={{
                fontSize: '13px',
                color: '#6b7280',
                fontWeight: '500',
                textTransform: 'capitalize'
              }}>
                {currentUser?.role || 'Role'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main" style={{ 
        marginLeft: '280px',
        marginTop: '80px',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: 'calc(100vh - 80px)'
      }}>
        {currentView === "dashboard" ? (
          <div>
            {/* Welcome Section */}
            <div style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '15px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              maxWidth: '800px',
              margin: '0 auto 30px auto',
              textAlign: 'center'
            }}>
              <h2 style={{ 
                color: '#111827',
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '15px'
              }}>
                Welcome to Rama Resort
              </h2>
              <p style={{
                color: '#6b7280',
                fontSize: '18px',
                lineHeight: '1.6',
                marginBottom: '0'
              }}>
                Use the sidebar navigation to manage your hotel operations efficiently.
              </p>
            </div>

            {/* Dashboard Statistics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {/* Total Sales */}
              <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  fontSize: '40px',
                  marginBottom: '15px'
                }}>💰</div>
                <h3 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  Rs. {invoices.reduce((total, invoice) => total + (invoice.total || 0), 0).toFixed(2)}
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  fontWeight: '500',
                  margin: '0'
                }}>
                  Today's Sales
                </p>
              </div>

              {/* Room Revenue */}
              <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  fontSize: '40px',
                  marginBottom: '15px'
                }}>🏨</div>
                <h3 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  Rs. {invoices.reduce((total, invoice) => {
                    return total + (invoice.room_price || 0);
                  }, 0).toFixed(2)}
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  fontWeight: '500',
                  margin: '0'
                }}>
                  Room Revenue
                </p>
              </div>

              {/* Food Revenue */}
              <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  fontSize: '40px',
                  marginBottom: '15px'
                }}>🍽️</div>
                <h3 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  Rs. {invoices.reduce((total, invoice) => {
                    const foodTotal = (invoice.foodItems || []).reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
                    return total + foodTotal;
                  }, 0).toFixed(2)}
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  fontWeight: '500',
                  margin: '0'
                }}>
                  Food Revenue
                </p>
              </div>

              {/* Total Invoices */}
              <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  fontSize: '40px',
                  marginBottom: '15px'
                }}>📋</div>
                <h3 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  {invoices.length}
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  fontWeight: '500',
                  margin: '0'
                }}>
                  Total Invoices
                </p>
              </div>
            </div>
            
            {/* Admin Analytics Charts - Only show for admin users */}
            {currentUser?.role === "admin" && (
              <AdminChartsSection 
                invoices={invoices} 
                rooms={rooms} 
                items={items} 
              />
            )}
          </div>
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
          currentUser?.role === "admin" ? (
            <div>
              <ActivityLogs onBackToDashboard={() => setCurrentView("dashboard")} />
            </div>
          ) : (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              color: '#f1f5f9',
              background: '#0f1419',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>🚫 Access Denied</h2>
              <p style={{ marginBottom: '2rem', color: '#94a3b8' }}>
                Activity logs are only accessible to administrators.
              </p>
              <button
                onClick={() => setCurrentView("dashboard")}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Back to Dashboard
              </button>
            </div>
          )
        ) : currentView === "reports" ? (
          currentUser?.role === "admin" ? (
            <div>
              <ReportDashboard onBack={() => setCurrentView("dashboard")} />
            </div>
          ) : (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              color: '#f1f5f9',
              background: '#0f1419',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>🚫 Access Denied</h2>
              <p style={{ marginBottom: '2rem', color: '#94a3b8' }}>
                Revenue reports are only accessible to administrators.
              </p>
              <button
                onClick={() => setCurrentView("dashboard")}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Back to Dashboard
              </button>
            </div>
          )
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
