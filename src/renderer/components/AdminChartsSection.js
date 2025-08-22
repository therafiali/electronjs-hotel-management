import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Analytics, Hotel, PieChart, Star } from '@mui/icons-material';
const AdminChartsSection = ({ invoices, rooms, items }) => {
    const [timeFilter, setTimeFilter] = useState('30d');
    // Filter invoices by time period
    const getFilteredInvoices = () => {
        const now = new Date();
        const daysBack = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
        const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
        return invoices.filter(invoice => new Date(invoice.date) >= cutoffDate);
    };
    // Revenue Trend Chart Removed as per user request
    // Room vs Food Revenue Distribution
    const getRevenueDistribution = () => {
        const filteredInvoices = getFilteredInvoices();
        const roomRevenue = filteredInvoices.reduce((sum, inv) => {
            if (inv.room_id && inv.guestInfo?.checkIn && inv.guestInfo?.checkOut) {
                // Calculate nights from check-in/check-out dates
                const checkIn = new Date(inv.guestInfo.checkIn);
                const checkOut = new Date(inv.guestInfo.checkOut);
                const nights = Math.ceil(Math.abs(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                // Calculate room revenue: price per night × number of nights
                return sum + ((inv.room_price || 0) * (nights > 0 ? nights : 1));
            }
            return sum;
        }, 0);
        const foodRevenue = filteredInvoices.reduce((sum, inv) => {
            if (inv.foodItems && Array.isArray(inv.foodItems)) {
                return sum + inv.foodItems.reduce((itemSum, item) => itemSum + ((item.quantity || 0) * (item.price || 0)), 0);
            }
            return sum;
        }, 0);
        const total = roomRevenue + foodRevenue;
        return {
            room: { amount: roomRevenue, percentage: total > 0 ? (roomRevenue / total) * 100 : 0 },
            food: { amount: foodRevenue, percentage: total > 0 ? (foodRevenue / total) * 100 : 0 },
            total
        };
    };
    // Room Occupancy Data
    const getRoomOccupancyData = () => {
        const filteredInvoices = getFilteredInvoices();
        const roomBookings = {};
        filteredInvoices.forEach(invoice => {
            if (invoice.room_id) {
                roomBookings[invoice.room_id] = (roomBookings[invoice.room_id] || 0) + 1;
            }
        });
        return rooms.map(room => ({
            ...room,
            bookings: roomBookings[room.roomId] || 0,
            occupancyRate: roomBookings[room.roomId] ?
                Math.min((roomBookings[room.roomId] / (timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90)) * 100, 100) : 0
        }));
    };
    // Top Performing Items
    const getTopItems = () => {
        const filteredInvoices = getFilteredInvoices();
        const itemSales = {};
        filteredInvoices.forEach(invoice => {
            if (invoice.foodItems && Array.isArray(invoice.foodItems)) {
                invoice.foodItems.forEach((foodItem) => {
                    const itemId = foodItem.itemId || foodItem.name;
                    if (!itemSales[itemId]) {
                        itemSales[itemId] = { quantity: 0, revenue: 0, name: foodItem.name };
                    }
                    itemSales[itemId].quantity += foodItem.quantity || 0;
                    itemSales[itemId].revenue += (foodItem.quantity || 0) * (foodItem.price || 0);
                });
            }
        });
        return Object.values(itemSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    // Recalculate data when timeFilter changes
    const revenueDistribution = useMemo(() => {
        const result = getRevenueDistribution();
        console.log(`Revenue distribution for ${timeFilter}:`, result);
        return result;
    }, [timeFilter, invoices]);
    const occupancyData = useMemo(() => {
        const result = getRoomOccupancyData();
        console.log(`Occupancy data for ${timeFilter}:`, result);
        return result;
    }, [timeFilter, invoices, rooms]);
    const topItems = useMemo(() => {
        const result = getTopItems();
        console.log(`Top items for ${timeFilter}:`, result);
        return result;
    }, [timeFilter, invoices]);
    return (_jsxs("div", { className: "admin-charts-section", children: [_jsxs("div", { className: "charts-header", children: [_jsxs("h2", { children: [_jsx("div", { style: {
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px',
                                    padding: '8px 16px',
                                    marginRight: '16px',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                }, children: _jsx(Analytics, { style: { color: 'white', fontSize: '24px' } }) }), "Analytics Dashboard"] }), _jsxs("div", { className: "time-filter", children: [_jsx("button", { className: timeFilter === '7d' ? 'active' : '', onClick: () => {
                                    console.log('Setting filter to 7 days');
                                    setTimeFilter('7d');
                                }, children: "7 Days" }), _jsx("button", { className: timeFilter === '30d' ? 'active' : '', onClick: () => {
                                    console.log('Setting filter to 30 days');
                                    setTimeFilter('30d');
                                }, children: "30 Days" }), _jsx("button", { className: timeFilter === '90d' ? 'active' : '', onClick: () => {
                                    console.log('Setting filter to 90 days');
                                    setTimeFilter('90d');
                                }, children: "90 Days" })] })] }), _jsxs("div", { className: "charts-grid", children: [revenueDistribution.total > 0 && (_jsxs("div", { className: "chart-card revenue-distribution", children: [_jsxs("h3", { children: [_jsx("div", { style: {
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                            borderRadius: '10px',
                                            padding: '6px 12px',
                                            marginRight: '12px',
                                            boxShadow: '0 3px 12px rgba(240, 147, 251, 0.3)'
                                        }, children: _jsx(PieChart, { style: { color: 'white', fontSize: '20px' } }) }), "Revenue Distribution"] }), _jsxs("div", { className: "pie-chart", children: [_jsx("div", { className: "pie-container", children: _jsxs("svg", { width: "150", height: "150", viewBox: "0 0 150 150", children: [_jsx("circle", { cx: "75", cy: "75", r: "60", fill: "none", stroke: "#8b5cf6", strokeWidth: "20", strokeDasharray: `${(revenueDistribution.room.percentage / 100) * 377} 377`, strokeDashoffset: "0", transform: "rotate(-90 75 75)" }), _jsx("circle", { cx: "75", cy: "75", r: "60", fill: "none", stroke: "#06b6d4", strokeWidth: "20", strokeDasharray: `${(revenueDistribution.food.percentage / 100) * 377} 377`, strokeDashoffset: `-${(revenueDistribution.room.percentage / 100) * 377}`, transform: "rotate(-90 75 75)" })] }) }), _jsxs("div", { className: "pie-legend", children: [_jsxs("div", { className: "legend-item", children: [_jsx("span", { className: "legend-color room-color" }), _jsxs("span", { children: ["Rooms: ", formatCurrency(revenueDistribution.room.amount)] }), _jsxs("span", { className: "percentage", children: ["(", revenueDistribution.room.percentage.toFixed(1), "%)"] })] }), _jsxs("div", { className: "legend-item", children: [_jsx("span", { className: "legend-color food-color" }), _jsxs("span", { children: ["Food & Items: ", formatCurrency(revenueDistribution.food.amount)] }), _jsxs("span", { className: "percentage", children: ["(", revenueDistribution.food.percentage.toFixed(1), "%)"] })] })] })] })] })), rooms.length > 0 && (_jsxs("div", { className: "chart-card room-occupancy", children: [_jsxs("h3", { children: [_jsx("div", { style: {
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                            borderRadius: '10px',
                                            padding: '6px 12px',
                                            marginRight: '12px',
                                            boxShadow: '0 3px 12px rgba(79, 172, 254, 0.3)'
                                        }, children: _jsx(Hotel, { style: { color: 'white', fontSize: '20px' } }) }), "Room Occupancy Rate"] }), _jsx("div", { className: "bar-chart", children: occupancyData.map((room, index) => (_jsxs("div", { className: "occupancy-bar", children: [_jsxs("div", { className: "bar-container", children: [_jsx("div", { className: "occupancy-fill", style: { height: `${room.occupancyRate}%` } }), _jsxs("span", { className: "occupancy-percentage", children: [room.occupancyRate.toFixed(0), "%"] })] }), _jsxs("span", { className: "room-label", children: ["Room ", room.roomNumber] }), _jsxs("span", { className: "booking-count", children: [room.bookings, " bookings"] })] }, room.roomId))) })] })), topItems.length > 0 && (_jsxs("div", { className: "chart-card top-items", children: [_jsxs("h3", { children: [_jsx("div", { style: {
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                            borderRadius: '10px',
                                            padding: '6px 12px',
                                            marginRight: '12px',
                                            boxShadow: '0 3px 12px rgba(250, 112, 154, 0.3)'
                                        }, children: _jsx(Star, { style: { color: 'white', fontSize: '20px' } }) }), "Top Selling Items"] }), _jsx("div", { className: "items-chart", children: topItems.map((item, index) => (_jsxs("div", { className: "item-bar", children: [_jsxs("div", { className: "item-info", children: [_jsxs("span", { className: "item-rank", children: ["#", index + 1] }), _jsx("span", { className: "item-name", children: item.name })] }), _jsxs("div", { className: "item-stats", children: [_jsx("div", { className: "item-revenue", children: formatCurrency(item.revenue) }), _jsxs("div", { className: "item-quantity", children: ["Qty: ", item.quantity] })] }), _jsx("div", { className: "item-progress", children: _jsx("div", { className: "progress-fill", style: {
                                                    width: `${topItems.length > 0 ? (item.revenue / topItems[0].revenue) * 100 : 0}%`
                                                } }) })] }, index))) })] }))] })] }));
};
export default AdminChartsSection;
