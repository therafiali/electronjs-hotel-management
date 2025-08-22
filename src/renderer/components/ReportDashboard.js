import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
const ReportDashboard = ({ onBack }) => {
    const [activeFilter, setActiveFilter] = useState('room');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [invoices, setInvoices] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    // Initialize dates (last 30 days)
    useEffect(() => {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        setToDate(today.toISOString().split('T')[0]);
        setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
    }, []);
    // Load data
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            setLoading(true);
            const [invoicesData, roomsData, itemsData] = await Promise.all([
                window.electronAPI.getAllInvoices(),
                window.electronAPI.getAllRooms(),
                window.electronAPI.getAllItems()
            ]);
            setInvoices(invoicesData);
            setRooms(roomsData);
            setItems(itemsData);
        }
        catch (error) {
            console.error('Error loading data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    // Filter invoices by date range
    const getFilteredInvoices = () => {
        if (!fromDate || !toDate)
            return invoices;
        return invoices.filter(invoice => {
            const invoiceDate = new Date(invoice.date);
            const from = new Date(fromDate);
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999); // Include full day
            return invoiceDate >= from && invoiceDate <= to;
        });
    };
    // Get room revenue data
    const getRoomRevenueData = () => {
        const filteredInvoices = getFilteredInvoices();
        const roomData = {};
        filteredInvoices.forEach(invoice => {
            if (invoice.room_id) {
                const room = rooms.find(r => r.roomId === invoice.room_id);
                if (room) {
                    if (!roomData[invoice.room_id]) {
                        roomData[invoice.room_id] = {
                            room,
                            invoices: [],
                            total: 0
                        };
                    }
                    roomData[invoice.room_id].invoices.push(invoice);
                    // Calculate nights from check-in/check-out dates
                    const checkIn = new Date(invoice.guestInfo.checkIn);
                    const checkOut = new Date(invoice.guestInfo.checkOut);
                    const nights = Math.ceil(Math.abs(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                    // Calculate room revenue: price per night × number of nights
                    const roomRevenue = (invoice.room_price || 0) * (nights > 0 ? nights : 1);
                    roomData[invoice.room_id].total += roomRevenue;
                }
            }
        });
        return Object.values(roomData);
    };
    // Get item sales data
    const getItemSalesData = () => {
        const filteredInvoices = getFilteredInvoices();
        const itemData = {};
        filteredInvoices.forEach(invoice => {
            if (invoice.foodItems && Array.isArray(invoice.foodItems)) {
                invoice.foodItems.forEach((foodItem) => {
                    const item = items.find(i => i.id === foodItem.itemId || i.name === foodItem.name);
                    if (item) {
                        if (!itemData[item.id]) {
                            itemData[item.id] = {
                                item,
                                quantity: 0,
                                total: 0,
                                invoices: []
                            };
                        }
                        itemData[item.id].quantity += foodItem.quantity || 0;
                        itemData[item.id].total += (foodItem.quantity || 0) * (foodItem.price || 0);
                        if (!itemData[item.id].invoices.find(inv => inv.invoiceId === invoice.invoiceId)) {
                            itemData[item.id].invoices.push(invoice);
                        }
                    }
                });
            }
        });
        return Object.values(itemData);
    };
    // Calculate totals
    const calculateTotals = () => {
        const filteredInvoices = getFilteredInvoices();
        const roomTotal = filteredInvoices.reduce((sum, inv) => {
            if (inv.room_id && inv.guestInfo.checkIn && inv.guestInfo.checkOut) {
                // Calculate nights from check-in/check-out dates
                const checkIn = new Date(inv.guestInfo.checkIn);
                const checkOut = new Date(inv.guestInfo.checkOut);
                const nights = Math.ceil(Math.abs(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                // Calculate room revenue: price per night × number of nights
                return sum + ((inv.room_price || 0) * (nights > 0 ? nights : 1));
            }
            return sum;
        }, 0);
        const itemTotal = filteredInvoices.reduce((sum, inv) => {
            if (inv.foodItems && Array.isArray(inv.foodItems)) {
                return sum + inv.foodItems.reduce((itemSum, item) => itemSum + ((item.quantity || 0) * (item.price || 0)), 0);
            }
            return sum;
        }, 0);
        const grandTotal = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
        return { roomTotal, itemTotal, grandTotal };
    };
    const { roomTotal, itemTotal, grandTotal } = calculateTotals();
    const roomRevenueData = getRoomRevenueData();
    const itemSalesData = getItemSalesData();
    const formatCurrency = (amount) => {
        return `Rs. ${amount.toFixed(2)}`;
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    if (loading) {
        return (_jsxs("div", { className: "report-loading", children: [_jsx("div", { className: "loading-spinner", children: "\u23F3" }), _jsx("p", { children: "Loading Report Data..." })] }));
    }
    return (_jsxs("div", { className: "report-dashboard", children: [_jsx("div", { className: "report-header", children: _jsxs("div", { className: "report-header-content", children: [_jsx("button", { onClick: onBack, className: "back-button", children: "\u2190 Back" }), _jsx("h1", { className: "report-title", children: " Revenue Reports" })] }) }), _jsxs("div", { className: "date-range-section", children: [_jsx("h3", { children: "\uD83D\uDCC5 Date Range Filter" }), _jsxs("div", { className: "date-inputs", children: [_jsxs("div", { className: "date-input-group", children: [_jsx("label", { children: "From Date:" }), _jsx("input", { type: "date", value: fromDate, onChange: (e) => setFromDate(e.target.value), className: "date-input" })] }), _jsxs("div", { className: "date-input-group", children: [_jsx("label", { children: "To Date:" }), _jsx("input", { type: "date", value: toDate, onChange: (e) => setToDate(e.target.value), className: "date-input" })] })] })] }), _jsxs("div", { className: "summary-cards", children: [_jsxs("div", { className: "summary-card", children: [_jsx("div", { className: "summary-icon", children: "\uD83C\uDFE8" }), _jsxs("div", { className: "summary-content", children: [_jsx("h3", { children: "Room Revenue" }), _jsx("p", { className: "summary-amount", children: formatCurrency(roomTotal) })] })] }), _jsxs("div", { className: "summary-card", children: [_jsx("div", { className: "summary-icon", children: "\uD83C\uDF7D\uFE0F" }), _jsxs("div", { className: "summary-content", children: [_jsx("h3", { children: "Food & Items" }), _jsx("p", { className: "summary-amount", children: formatCurrency(itemTotal) })] })] }), _jsxs("div", { className: "summary-card grand-total", children: [_jsx("div", { className: "summary-icon", children: "\uD83D\uDCB0" }), _jsxs("div", { className: "summary-content", children: [_jsx("h3", { children: "Grand Total" }), _jsx("p", { className: "summary-amount", children: formatCurrency(grandTotal) })] })] })] }), _jsxs("div", { className: "filter-tabs", children: [_jsx("button", { className: `filter-tab ${activeFilter === 'room' ? 'active' : ''}`, onClick: () => setActiveFilter('room'), children: "\uD83C\uDFE8 Room Reports" }), _jsx("button", { className: `filter-tab ${activeFilter === 'item' ? 'active' : ''}`, onClick: () => setActiveFilter('item'), children: "\uD83C\uDF7D\uFE0F Item Reports" }), _jsx("button", { className: `filter-tab ${activeFilter === 'roomitem' ? 'active' : ''}`, onClick: () => setActiveFilter('roomitem'), children: "\uD83D\uDCCB Combined Report" })] }), _jsxs("div", { className: "report-content", children: [activeFilter === 'room' && (_jsxs("div", { className: "room-report", children: [_jsx("h3", { children: "\uD83C\uDFE8 Room Revenue Report" }), _jsx("div", { className: "report-grid", children: roomRevenueData.map((roomData) => (_jsxs("div", { className: `report-card clickable ${selectedRoom === roomData.room.roomId ? 'selected' : ''}`, onClick: () => setSelectedRoom(selectedRoom === roomData.room.roomId ? null : roomData.room.roomId), children: [_jsxs("div", { className: "card-header", children: [_jsxs("h4", { children: ["Room ", roomData.room.roomNumber] }), _jsx("span", { className: "room-type", children: roomData.room.roomType })] }), _jsxs("div", { className: "card-stats", children: [_jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "Bookings:" }), _jsx("span", { className: "stat-value", children: roomData.invoices.length })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "Revenue:" }), _jsx("span", { className: "stat-value total-amount", children: formatCurrency(roomData.total) })] })] }), selectedRoom === roomData.room.roomId && (_jsxs("div", { className: "detailed-data", children: [_jsx("h5", { children: "\uD83D\uDCCB Booking Details:" }), roomData.invoices.map((invoice) => (_jsxs("div", { className: "detail-row", children: [_jsx("span", { className: "detail-date", children: formatDate(invoice.date) }), _jsx("span", { className: "detail-guest", children: invoice.guestInfo?.name || 'Guest' }), _jsx("span", { className: "detail-amount", children: formatCurrency(invoice.room_price) })] }, invoice.invoiceId)))] }))] }, roomData.room.roomId))) }), _jsx("div", { className: "section-total", children: _jsxs("strong", { children: ["Total Room Revenue: ", formatCurrency(roomTotal)] }) })] })), activeFilter === 'item' && (_jsxs("div", { className: "item-report", children: [_jsx("h3", { children: "\uD83C\uDF7D\uFE0F Item Sales Report" }), _jsx("div", { className: "report-grid", children: itemSalesData.map((itemData) => (_jsxs("div", { className: `report-card clickable ${selectedItem === itemData.item.id ? 'selected' : ''}`, onClick: () => setSelectedItem(selectedItem === itemData.item.id ? null : itemData.item.id), children: [_jsxs("div", { className: "card-header", children: [_jsx("h4", { children: itemData.item.name }), _jsx("span", { className: "item-category", children: itemData.item.category })] }), _jsxs("div", { className: "card-stats", children: [_jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "Quantity Sold:" }), _jsx("span", { className: "stat-value", children: itemData.quantity })] }), _jsxs("div", { className: "stat", children: [_jsx("span", { className: "stat-label", children: "Revenue:" }), _jsx("span", { className: "stat-value total-amount", children: formatCurrency(itemData.total) })] })] }), selectedItem === itemData.item.id && (_jsxs("div", { className: "detailed-data", children: [_jsx("h5", { children: "\uD83D\uDCCB Sales Details:" }), itemData.invoices.map((invoice) => {
                                                    const foodItem = invoice.foodItems?.find((fi) => fi.itemId === itemData.item.id || fi.name === itemData.item.name);
                                                    return (_jsxs("div", { className: "detail-row", children: [_jsx("span", { className: "detail-date", children: formatDate(invoice.date) }), _jsxs("span", { className: "detail-qty", children: ["Qty: ", foodItem?.quantity || 0] }), _jsx("span", { className: "detail-amount", children: formatCurrency((foodItem?.quantity || 0) * (foodItem?.price || 0)) })] }, invoice.invoiceId));
                                                })] }))] }, itemData.item.id))) }), _jsx("div", { className: "section-total", children: _jsxs("strong", { children: ["Total Item Revenue: ", formatCurrency(itemTotal)] }) })] })), activeFilter === 'roomitem' && (_jsxs("div", { className: "combined-report", children: [_jsx("h3", { children: "\uD83D\uDCCB Combined Revenue Report" }), _jsxs("div", { className: "combined-grid", children: [_jsxs("div", { className: "combined-section", children: [_jsx("h4", { children: "\uD83C\uDFC6 Top Performing Rooms" }), roomRevenueData
                                                .sort((a, b) => b.total - a.total)
                                                .slice(0, 5)
                                                .map((roomData, index) => (_jsxs("div", { className: "performance-row", children: [_jsxs("span", { className: "rank", children: ["#", index + 1] }), _jsxs("span", { className: "name", children: ["Room ", roomData.room.roomNumber] }), _jsx("span", { className: "amount", children: formatCurrency(roomData.total) })] }, roomData.room.roomId)))] }), _jsxs("div", { className: "combined-section", children: [_jsx("h4", { children: "\uD83C\uDFC6 Top Selling Items" }), itemSalesData
                                                .sort((a, b) => b.total - a.total)
                                                .slice(0, 5)
                                                .map((itemData, index) => (_jsxs("div", { className: "performance-row", children: [_jsxs("span", { className: "rank", children: ["#", index + 1] }), _jsx("span", { className: "name", children: itemData.item.name }), _jsx("span", { className: "amount", children: formatCurrency(itemData.total) })] }, itemData.item.id)))] })] }), _jsxs("div", { className: "grand-total-breakdown", children: [_jsx("h4", { children: "\uD83D\uDCB0 Revenue Breakdown" }), _jsxs("div", { className: "breakdown-chart", children: [_jsxs("div", { className: "breakdown-item", children: [_jsx("span", { className: "breakdown-label", children: "Room Revenue" }), _jsx("div", { className: "breakdown-bar", children: _jsx("div", { className: "breakdown-fill room-fill", style: { width: `${(roomTotal / grandTotal) * 100}%` } }) }), _jsx("span", { className: "breakdown-amount", children: formatCurrency(roomTotal) })] }), _jsxs("div", { className: "breakdown-item", children: [_jsx("span", { className: "breakdown-label", children: "Item Revenue" }), _jsx("div", { className: "breakdown-bar", children: _jsx("div", { className: "breakdown-fill item-fill", style: { width: `${(itemTotal / grandTotal) * 100}%` } }) }), _jsx("span", { className: "breakdown-amount", children: formatCurrency(itemTotal) })] }), _jsx("div", { className: "breakdown-total", children: _jsxs("strong", { children: ["Grand Total: ", formatCurrency(grandTotal)] }) })] })] })] }))] })] }));
};
export default ReportDashboard;
