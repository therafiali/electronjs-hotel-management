import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import InvoiceForm from "./components/InvoiceForm";
import InvoiceList from "./components/InvoiceList";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import PDFCreator from "./components/PDFCreator";
import ItemsForm from "./components/ItemsForm";
import RoomForm from "./components/RoomForm";
import ActivityLogs from "./components/ActivityLogs";
import ReportDashboard from "./components/ReportDashboard";
import AdminChartsSection from "./components/AdminChartsSection";
const App = () => {
    const [message, setMessage] = useState("");
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [currentView, setCurrentView] = useState("dashboard");
    const [invoices, setInvoices] = useState([]);
    const [items, setItems] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [debugData, setDebugData] = useState("");
    const [loading, setLoading] = useState(false);
    const [databasePath, setDatabasePath] = useState("");
    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    useEffect(() => {
        // Listen for messages from the main process
        if (window.electronAPI) {
            window.electronAPI.onMessage((msg) => {
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
        loadDatabasePath(); // Load database path
    }, []);
    const handleSendMessage = () => {
        if (message.trim() && window.electronAPI) {
            window.electronAPI.sendMessage(message);
            setMessage("");
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };
    const handleInvoiceSubmit = async (invoiceData) => {
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
        }
        catch (error) {
            console.error("Error saving invoice:", error);
            alert("Error saving invoice to database!");
        }
        finally {
            setLoading(false);
        }
    };
    const handleInvoiceClick = (invoice) => {
        console.log("Invoice clicked:", invoice);
    };
    const handlePrintInvoice = async (invoiceId) => {
        try {
            setLoading(true);
            console.log(`🖨️ Printing invoice: ${invoiceId}`);
            const result = await window.electronAPI.createPDF("invoice", invoiceId);
            if (result.success) {
                // Open the PDF file after creation
                await window.electronAPI.openFile(result.filepath);
            }
        }
        catch (error) {
            console.error("Error printing invoice:", error);
            alert("❌ Error creating invoice PDF");
        }
        finally {
            setLoading(false);
        }
    };
    const loadInvoices = async () => {
        try {
            setLoading(true);
            const allInvoices = await window.electronAPI.getAllInvoices();
            setInvoices(allInvoices);
            console.log("Loaded invoices from database:", allInvoices);
        }
        catch (error) {
            console.error("Error loading invoices:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadDatabasePath = async () => {
        try {
            const result = await window.electronAPI.getDatabasePath();
            if (result.success) {
                setDatabasePath(result.path);
            }
            else {
                setDatabasePath("Error getting database path");
            }
        }
        catch (error) {
            console.error("Error getting database path:", error);
            setDatabasePath("Error: " + error.message);
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
        }
        catch (error) {
            console.error("Error loading debug data:", error);
            setDebugData("Error loading data from database: " + error.message);
        }
        finally {
            setLoading(false);
        }
    };
    // Items handlers
    const handleItemSubmit = async (itemData) => {
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
        }
        catch (error) {
            console.error("Error saving item:", error);
            return { success: false };
        }
        finally {
            setLoading(false);
        }
    };
    const handleUpdateItemPrice = async (itemId, newPrice) => {
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
        }
        catch (error) {
            console.error("Error updating item price:", error);
            alert("Error updating item price!");
            throw error; // Re-throw to let EditButton handle the error
        }
        finally {
            setLoading(false);
        }
    };
    const handleUpdateRoomPrice = async (roomId, newPrice) => {
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
        }
        catch (error) {
            console.error("Error updating room price:", error);
            alert("Error updating room price!");
            throw error; // Re-throw to let EditButton handle the error
        }
        finally {
            setLoading(false);
        }
    };
    // Room handlers
    const handleRoomSubmit = async (roomData) => {
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
        }
        catch (error) {
            console.error("Error saving room:", error);
            alert("Error saving room to database!");
            return { success: false };
        }
        finally {
            setLoading(false);
        }
    };
    const handleItemClick = (item) => {
        console.log("Item clicked:", item);
        alert(`Item Details:\nName: ${item.name}\nCategory: ${item.category}\nPrice: Rs. ${item.price.toFixed(2)}`);
    };
    const loadItems = async () => {
        try {
            setLoading(true);
            const allItems = await window.electronAPI.getAllItems();
            setItems(allItems);
            console.log("Loaded items from database:", allItems);
        }
        catch (error) {
            console.error("Error loading items:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadRooms = async () => {
        try {
            setLoading(true);
            const allRooms = await window.electronAPI.getAllRooms();
            setRooms(allRooms);
            console.log("Loaded rooms from database:", allRooms);
        }
        catch (error) {
            console.error("Error loading rooms:", error);
        }
        finally {
            setLoading(false);
        }
    };
    // Authentication handlers
    const handleLoginSuccess = (user) => {
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
        return _jsx(LoginPage, { onLoginSuccess: handleLoginSuccess });
    }
    return (_jsxs("div", { className: "app", children: [_jsx(Dashboard, { onNavigateToDashboard: () => setCurrentView("dashboard"), onNavigateToInvoice: () => setCurrentView("form"), onNavigateToList: async () => {
                    await loadInvoices();
                    setCurrentView("list");
                }, onNavigateToItems: async () => {
                    await loadItems();
                    setCurrentView("items");
                }, onNavigateToRooms: async () => {
                    await loadRooms();
                    setCurrentView("rooms");
                }, onNavigateToActivityLogs: () => setCurrentView("activityLogs"), onNavigateToReports: () => setCurrentView("reports"), onLogout: handleLogout, currentUser: currentUser }), _jsxs("header", { style: {
                    position: 'fixed',
                    top: 0,
                    left: '320px',
                    right: 0,
                    height: '140px',
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 40px',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }, children: [_jsx("div", { style: {
                            display: 'flex',
                            alignItems: 'center'
                        }, children: _jsx("h1", { style: {
                                margin: 0,
                                fontSize: '30px',
                                color: '#111827',
                                fontWeight: '700',
                                letterSpacing: '-0.025em'
                            }, children: "Rama Resort Management System" }) }), _jsx("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '24px'
                        }, children: _jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 16px',
                                backgroundColor: '#f9fafb',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb'
                            }, children: [_jsx("div", { style: {
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
                                    }, children: currentUser?.name?.charAt(0)?.toUpperCase() || 'U' }), _jsxs("div", { children: [_jsxs("div", { style: {
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                color: '#111827',
                                                lineHeight: '1.2'
                                            }, children: ["Welcome, ", currentUser?.name || 'User'] }), _jsx("div", { style: {
                                                fontSize: '13px',
                                                color: '#6b7280',
                                                fontWeight: '500',
                                                textTransform: 'capitalize'
                                            }, children: currentUser?.role || 'Role' })] })] }) })] }), _jsx("main", { className: "app-main", style: {
                    marginLeft: '320px',
                    marginTop: '140px',
                    padding: '20px',
                    backgroundColor: '#f5f5f5',
                    minHeight: 'calc(100vh - 80px)'
                }, children: currentView === "dashboard" ? (_jsxs("div", { children: [_jsxs("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '20px',
                                maxWidth: '1000px',
                                margin: '0 auto'
                            }, children: [_jsxs("div", { style: {
                                        backgroundColor: 'white',
                                        padding: '30px',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                        textAlign: 'center',
                                        border: '1px solid #e5e7eb'
                                    }, children: [_jsx("div", { style: {
                                                fontSize: '40px',
                                                marginBottom: '15px'
                                            }, children: "\uD83D\uDCB0" }), _jsxs("h3", { style: {
                                                fontSize: '32px',
                                                fontWeight: '700',
                                                color: '#111827',
                                                marginBottom: '8px'
                                            }, children: ["Rs. ", invoices.reduce((total, invoice) => total + (invoice.total || 0), 0).toFixed(2)] }), _jsx("p", { style: {
                                                fontSize: '16px',
                                                color: '#6b7280',
                                                fontWeight: '500',
                                                margin: '0'
                                            }, children: "Today's Sales" })] }), _jsxs("div", { style: {
                                        backgroundColor: 'white',
                                        padding: '30px',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                        textAlign: 'center',
                                        border: '1px solid #e5e7eb'
                                    }, children: [_jsx("div", { style: {
                                                fontSize: '40px',
                                                marginBottom: '15px'
                                            }, children: "\uD83C\uDFE8" }), _jsxs("h3", { style: {
                                                fontSize: '32px',
                                                fontWeight: '700',
                                                color: '#111827',
                                                marginBottom: '8px'
                                            }, children: ["Rs. ", invoices.reduce((total, invoice) => {
                                                    if (invoice.room_id && invoice.guestInfo?.checkIn && invoice.guestInfo?.checkOut) {
                                                        // Calculate nights from check-in/check-out dates
                                                        const checkIn = new Date(invoice.guestInfo.checkIn);
                                                        const checkOut = new Date(invoice.guestInfo.checkOut);
                                                        const nights = Math.ceil(Math.abs(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                                                        // Calculate room revenue: price per night × number of nights
                                                        return total + ((invoice.room_price || 0) * (nights > 0 ? nights : 1));
                                                    }
                                                    return total;
                                                }, 0).toFixed(2)] }), _jsx("p", { style: {
                                                fontSize: '16px',
                                                color: '#6b7280',
                                                fontWeight: '500',
                                                margin: '0'
                                            }, children: "Room Revenue" })] }), _jsxs("div", { style: {
                                        backgroundColor: 'white',
                                        padding: '30px',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                        textAlign: 'center',
                                        border: '1px solid #e5e7eb'
                                    }, children: [_jsx("div", { style: {
                                                fontSize: '40px',
                                                marginBottom: '15px'
                                            }, children: "\uD83C\uDF7D\uFE0F" }), _jsxs("h3", { style: {
                                                fontSize: '32px',
                                                fontWeight: '700',
                                                color: '#111827',
                                                marginBottom: '8px'
                                            }, children: ["Rs. ", invoices.reduce((total, invoice) => {
                                                    const foodTotal = (invoice.foodItems || []).reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
                                                    return total + foodTotal;
                                                }, 0).toFixed(2)] }), _jsx("p", { style: {
                                                fontSize: '16px',
                                                color: '#6b7280',
                                                fontWeight: '500',
                                                margin: '0'
                                            }, children: "Food Revenue" })] }), _jsxs("div", { style: {
                                        backgroundColor: 'white',
                                        padding: '30px',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                        textAlign: 'center',
                                        border: '1px solid #e5e7eb'
                                    }, children: [_jsx("div", { style: {
                                                fontSize: '40px',
                                                marginBottom: '15px'
                                            }, children: "\uD83D\uDCCB" }), _jsx("h3", { style: {
                                                fontSize: '32px',
                                                fontWeight: '700',
                                                color: '#111827',
                                                marginBottom: '8px'
                                            }, children: invoices.length }), _jsx("p", { style: {
                                                fontSize: '16px',
                                                color: '#6b7280',
                                                fontWeight: '500',
                                                margin: '0'
                                            }, children: "Total Invoices" })] })] }), currentUser?.role === "admin" && (_jsx(AdminChartsSection, { invoices: invoices, rooms: rooms, items: items })), currentUser?.role === "admin" && (_jsxs("div", { style: {
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "12px",
                                padding: "25px",
                                margin: "20px 0",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                maxWidth: "1000px",
                                marginLeft: "auto",
                                marginRight: "auto"
                            }, children: [_jsx("h3", { style: {
                                        margin: "0 0 15px 0",
                                        color: "#111827",
                                        fontSize: "18px",
                                        fontWeight: "600",
                                        textAlign: "center"
                                    }, children: "\uD83D\uDDC4\uFE0F Database Management" }), _jsx("p", { style: {
                                        margin: "0 0 20px 0",
                                        fontSize: "14px",
                                        color: "#6b7280",
                                        textAlign: "center"
                                    }, children: "Upload updated database files or export current database for backup" }), _jsxs("div", { style: {
                                        background: "#f8f9fa",
                                        border: "1px solid #dee2e6",
                                        borderRadius: "8px",
                                        padding: "15px",
                                        margin: "15px 0",
                                        textAlign: "left"
                                    }, children: [_jsx("h4", { style: { margin: "0 0 10px 0", color: "#0c5460" }, children: "\uD83D\uDCC1 Current Database Location:" }), _jsx("p", { style: {
                                                margin: "0",
                                                fontFamily: "monospace",
                                                fontSize: "12px",
                                                color: "#0c5460",
                                                wordBreak: "break-all",
                                                background: "#e9ecef",
                                                padding: "10px",
                                                borderRadius: "6px",
                                                border: "1px solid #ced4da"
                                            }, children: databasePath || "Loading database path..." }), _jsx("button", { onClick: loadDatabasePath, style: {
                                                background: "#6c757d",
                                                color: "white",
                                                border: "none",
                                                padding: "5px 10px",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontSize: "12px",
                                                marginTop: "10px"
                                            }, children: "Refresh Path" })] }), _jsxs("div", { style: {
                                        display: "flex",
                                        gap: "15px",
                                        justifyContent: "center",
                                        flexWrap: "wrap"
                                    }, children: [_jsx("button", { onClick: async () => {
                                                try {
                                                    setLoading(true);
                                                    const result = await window.electronAPI.selectDatabaseFile();
                                                    if (result.success && result.filePath) {
                                                        const uploadResult = await window.electronAPI.uploadDatabase(result.filePath);
                                                        if (uploadResult.success) {
                                                            console.log(`✅ ${uploadResult.message}\nBackup created at: ${uploadResult.backupPath}`);
                                                            await loadInvoices();
                                                            await loadItems();
                                                            await loadRooms();
                                                            await loadDatabasePath();
                                                        }
                                                        else {
                                                            console.error(`❌ ${uploadResult.message}`);
                                                        }
                                                    }
                                                    else {
                                                        console.log('ℹ️ No file selected');
                                                    }
                                                }
                                                catch (error) {
                                                    console.error(`❌ Error: ${error.message}`);
                                                }
                                                finally {
                                                    setLoading(false);
                                                }
                                            }, disabled: loading, style: {
                                                background: "#28a745",
                                                color: "white",
                                                border: "none",
                                                padding: "10px 18px",
                                                borderRadius: "8px",
                                                cursor: loading ? "not-allowed" : "pointer",
                                                fontSize: "13px",
                                                fontWeight: "600",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                opacity: loading ? 0.6 : 1
                                            }, children: "\uD83D\uDCC1 Upload Database" }), _jsx("button", { onClick: async () => {
                                                try {
                                                    setLoading(true);
                                                    const result = await window.electronAPI.exportDatabase();
                                                    if (result.success) {
                                                        console.log(`✅ ${result.message}\nExported to: ${result.filePath}`);
                                                    }
                                                    else {
                                                        console.log(`ℹ️ ${result.message}`);
                                                    }
                                                }
                                                catch (error) {
                                                    console.error(`❌ Error: ${error.message}`);
                                                }
                                                finally {
                                                    setLoading(false);
                                                }
                                            }, disabled: loading, style: {
                                                background: "#17a2b8",
                                                color: "white",
                                                border: "none",
                                                padding: "10px 18px",
                                                borderRadius: "8px",
                                                cursor: loading ? "not-allowed" : "pointer",
                                                fontSize: "13px",
                                                fontWeight: "600",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                opacity: loading ? 0.6 : 1
                                            }, children: "\uD83D\uDCE4 Export Database" })] })] }))] })) : currentView === "form" ? (_jsxs("div", { children: [_jsx(InvoiceForm, { onSubmit: handleInvoiceSubmit, rooms: rooms, items: items }), _jsxs("div", { style: { textAlign: "center", marginTop: "20px" }, children: [_jsx("button", { onClick: async () => {
                                        await loadInvoices();
                                        setCurrentView("list");
                                    }, style: {
                                        background: "#27ae60",
                                        color: "white",
                                        border: "none",
                                        padding: "10px 20px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        marginRight: "10px",
                                    }, children: "View Invoice List" }), _jsx("button", { onClick: async () => {
                                        setCurrentView("debug");
                                        await loadDebugData();
                                    }, style: {
                                        background: "#e74c3c",
                                        color: "white",
                                        border: "none",
                                        padding: "10px 20px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                    }, children: "Debug Data Preview" })] })] })) : currentView === "list" ? (_jsxs("div", { children: [_jsx(InvoiceList, { invoices: invoices, onInvoiceClick: handleInvoiceClick, onPrintInvoice: handlePrintInvoice }), _jsxs("div", { style: { textAlign: "center", marginTop: "20px" }, children: [_jsx("button", { onClick: () => setCurrentView("dashboard"), style: {
                                        background: "#3498db",
                                        color: "white",
                                        border: "none",
                                        padding: "10px 20px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        marginRight: "10px",
                                    }, children: "Back to Dashboard" }), _jsx("button", { onClick: async () => {
                                        setCurrentView("debug");
                                        await loadDebugData();
                                    }, style: {
                                        background: "#e74c3c",
                                        color: "white",
                                        border: "none",
                                        padding: "10px 20px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                    }, children: "Debug Data Preview" })] })] })) : currentView === "pdf" ? (_jsxs("div", { children: [_jsx(PDFCreator, {}), _jsx("div", { style: { textAlign: "center", marginTop: "20px" }, children: _jsx("button", { onClick: () => setCurrentView("dashboard"), style: {
                                    background: "#3498db",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 20px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                }, children: "Back to Dashboard" }) })] })) : currentView === "items" ? (_jsxs("div", { children: [_jsx(ItemsForm, { onSubmit: handleItemSubmit, items: items, onRefreshItems: loadItems, onUpdateItemPrice: handleUpdateItemPrice }), _jsx("div", { style: { textAlign: "center", marginTop: "20px" }, children: _jsx("button", { onClick: () => setCurrentView("dashboard"), style: {
                                    background: "#3498db",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 20px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                }, children: "Back to Dashboard" }) })] })) : currentView === "rooms" ? (_jsxs("div", { children: [_jsx(RoomForm, { onSubmit: handleRoomSubmit, rooms: rooms, onRefreshRooms: loadRooms, onUpdateRoomPrice: handleUpdateRoomPrice }), _jsx("div", { style: { textAlign: "center", marginTop: "20px" }, children: _jsx("button", { onClick: () => setCurrentView("dashboard"), style: {
                                    background: "#3498db",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 20px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                }, children: "Back to Dashboard" }) })] })) : currentView === "activityLogs" ? (currentUser?.role === "admin" ? (_jsx("div", { children: _jsx(ActivityLogs, { onBackToDashboard: () => setCurrentView("dashboard") }) })) : (_jsxs("div", { style: {
                        padding: '2rem',
                        textAlign: 'center',
                        color: '#f1f5f9',
                        background: '#0f1419',
                        minHeight: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }, children: [_jsx("h2", { style: { color: '#ef4444', marginBottom: '1rem' }, children: "\uD83D\uDEAB Access Denied" }), _jsx("p", { style: { marginBottom: '2rem', color: '#94a3b8' }, children: "Activity logs are only accessible to administrators." }), _jsx("button", { onClick: () => setCurrentView("dashboard"), style: {
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                                border: 'none',
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }, children: "Back to Dashboard" })] }))) : currentView === "reports" ? (currentUser?.role === "admin" ? (_jsx("div", { children: _jsx(ReportDashboard, { onBack: () => setCurrentView("dashboard") }) })) : (_jsxs("div", { style: {
                        padding: '2rem',
                        textAlign: 'center',
                        color: '#f1f5f9',
                        background: '#0f1419',
                        minHeight: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }, children: [_jsx("h2", { style: { color: '#ef4444', marginBottom: '1rem' }, children: "\uD83D\uDEAB Access Denied" }), _jsx("p", { style: { marginBottom: '2rem', color: '#94a3b8' }, children: "Revenue reports are only accessible to administrators." }), _jsx("button", { onClick: () => setCurrentView("dashboard"), style: {
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                                border: 'none',
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }, children: "Back to Dashboard" })] }))) : (_jsxs("div", { children: [_jsxs("div", { style: { textAlign: "center", marginBottom: "20px" }, children: [_jsx("h2", { children: "\uD83D\uDD0D Real Database Data Preview" }), _jsx("p", { children: "This shows the actual data from getAllInvoices() in your database" })] }), loading && (_jsx("div", { style: { textAlign: "center", margin: "20px" }, children: _jsx("p", { children: "Loading data from database..." }) })), _jsx("div", { style: {
                                background: "#f8f9fa",
                                border: "1px solid #dee2e6",
                                borderRadius: "8px",
                                padding: "20px",
                                margin: "20px",
                                maxHeight: "500px",
                                overflow: "auto",
                            }, children: _jsx("pre", { style: {
                                    margin: 0,
                                    whiteSpace: "pre-wrap",
                                    fontFamily: "monospace",
                                    fontSize: "12px",
                                    color: "#333",
                                }, children: debugData ||
                                    'Click "Load Real Data" to see actual database content' }) }), _jsxs("div", { style: { textAlign: "center", marginTop: "20px" }, children: [_jsx("button", { onClick: loadDebugData, disabled: loading, style: {
                                        background: "#17a2b8",
                                        color: "white",
                                        border: "none",
                                        padding: "10px 20px",
                                        borderRadius: "6px",
                                        cursor: loading ? "not-allowed" : "pointer",
                                        fontSize: "14px",
                                        marginRight: "10px",
                                        opacity: loading ? 0.6 : 1,
                                    }, children: loading ? "Loading..." : "Load Real Data" }), _jsx("button", { onClick: () => setCurrentView("dashboard"), style: {
                                        background: "#3498db",
                                        color: "white",
                                        border: "none",
                                        padding: "10px 20px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        marginRight: "10px",
                                    }, children: "Back to Dashboard" }), _jsx("button", { onClick: async () => {
                                        await loadInvoices();
                                        setCurrentView("list");
                                    }, style: {
                                        background: "#27ae60",
                                        color: "white",
                                        border: "none",
                                        padding: "10px 20px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                    }, children: "Back to List" })] })] })) })] }));
};
export default App;
