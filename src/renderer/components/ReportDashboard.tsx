import React, { useState, useEffect } from 'react';

interface Invoice {
  invoiceId: string;
  guestInfo: any;
  roomInfo: any;
  foodItems: any;
  taxRate: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  date: string;
  room_id: string;
  room_price: number;
}

interface Room {
  roomId: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  createdDate: string;
}

interface Item {
  id: string;
  name: string;
  item_name: string;
  category: string;
  price: number;
  createdDate: string;
}

interface ReportDashboardProps {
  onBack: () => void;
}

const ReportDashboard: React.FC<ReportDashboardProps> = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState<'room' | 'item' | 'laundry' | 'roomitem'>('room');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

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
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter invoices by date range
  const getFilteredInvoices = () => {
    if (!fromDate || !toDate) return invoices;
    
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
    const roomData: { [key: string]: { room: Room; invoices: Invoice[]; total: number } } = {};
    
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

  // Get item sales data (Food items only)
  const getItemSalesData = () => {
    const filteredInvoices = getFilteredInvoices();
    const itemData: { [key: string]: { item: Item; quantity: number; total: number; invoices: Invoice[] } } = {};
    
    filteredInvoices.forEach(invoice => {
      if (invoice.foodItems && Array.isArray(invoice.foodItems)) {
        invoice.foodItems.forEach((foodItem: any) => {
          const item = items.find(i => i.id === foodItem.itemId || i.name === foodItem.name);
          if (item && item.category === 'Food') {
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

  // Get all item sales data (Food + Laundry) for combined report
  const getAllItemSalesData = () => {
    const filteredInvoices = getFilteredInvoices();
    const itemData: { [key: string]: { item: Item; quantity: number; total: number; invoices: Invoice[] } } = {};
    
    filteredInvoices.forEach(invoice => {
      if (invoice.foodItems && Array.isArray(invoice.foodItems)) {
        invoice.foodItems.forEach((foodItem: any) => {
          const item = items.find(i => i.id === foodItem.itemId || i.name === foodItem.name);
          if (item && (item.category === 'Food' || item.category === 'Laundry')) {
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

  // Get laundry sales data
  const getLaundrySalesData = () => {
    const filteredInvoices = getFilteredInvoices();
    const laundryData: { [key: string]: { item: Item; quantity: number; total: number; invoices: Invoice[] } } = {};
    
    filteredInvoices.forEach(invoice => {
      if (invoice.foodItems && Array.isArray(invoice.foodItems)) {
        invoice.foodItems.forEach((foodItem: any) => {
          const item = items.find(i => i.id === foodItem.itemId || i.name === foodItem.name);
          if (item && item.category === 'Laundry') {
            if (!laundryData[item.id]) {
              laundryData[item.id] = {
                item,
                quantity: 0,
                total: 0,
                invoices: []
              };
            }
            laundryData[item.id].quantity += foodItem.quantity || 0;
            laundryData[item.id].total += (foodItem.quantity || 0) * (foodItem.price || 0);
            if (!laundryData[item.id].invoices.find(inv => inv.invoiceId === invoice.invoiceId)) {
              laundryData[item.id].invoices.push(invoice);
            }
          }
        });
      }
    });
    
    return Object.values(laundryData);
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
    
    const foodTotal = filteredInvoices.reduce((sum, inv) => {
      if (inv.foodItems && Array.isArray(inv.foodItems)) {
        return sum + inv.foodItems.reduce((itemSum: number, item: any) => {
          const itemData = items.find(i => i.id === item.itemId || i.name === item.name);
          if (itemData && itemData.category === 'Food') {
            return itemSum + ((item.quantity || 0) * (item.price || 0));
          }
          return itemSum;
        }, 0);
      }
      return sum;
    }, 0);
    
    const laundryTotal = filteredInvoices.reduce((sum, inv) => {
      if (inv.foodItems && Array.isArray(inv.foodItems)) {
        return sum + inv.foodItems.reduce((itemSum: number, item: any) => {
          const itemData = items.find(i => i.id === item.itemId || i.name === item.name);
          if (itemData && itemData.category === 'Laundry') {
            return itemSum + ((item.quantity || 0) * (item.price || 0));
          }
          return itemSum;
        }, 0);
      }
      return sum;
    }, 0);
    
    const grandTotal = roomTotal + foodTotal + laundryTotal;
    
    return { roomTotal, foodTotal, laundryTotal, grandTotal };
  };

  const { roomTotal, foodTotal, laundryTotal, grandTotal } = calculateTotals();
  const roomRevenueData = getRoomRevenueData();
  const itemSalesData = getItemSalesData();
  const laundrySalesData = getLaundrySalesData();

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="report-loading">
        <div className="loading-spinner">⏳</div>
        <p>Loading Report Data...</p>
      </div>
    );
  }

  return (
    <div className="report-dashboard">
      {/* Header */}
      <div className="report-header">
        <div className="report-header-content">
          <button onClick={onBack} className="back-button">
            ← Back
          </button>
          <h1 className="report-title"> Revenue Reports</h1>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="date-range-section">
        <h3>📅 Date Range Filter</h3>
        <div className="date-inputs">
          <div className="date-input-group">
            <label>From Date:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="date-input-group">
            <label>To Date:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="date-input"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon">🏨</div>
          <div className="summary-content">
            <h3>Room Revenue</h3>
            <p className="summary-amount">{formatCurrency(roomTotal)}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🍽️</div>
          <div className="summary-content">
            <h3>Food</h3>
            <p className="summary-amount">{formatCurrency(foodTotal)}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">👕</div>
          <div className="summary-content">
            <h3>Laundry Revenue</h3>
            <p className="summary-amount">{formatCurrency(laundryTotal)}</p>
          </div>
        </div>
        <div className="summary-card grand-total">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <h3>Grand Total</h3>
            <p className="summary-amount">{formatCurrency(grandTotal)}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${activeFilter === 'room' ? 'active' : ''}`}
          onClick={() => setActiveFilter('room')}
        >
          🏨 Room Reports
        </button>
        <button
          className={`filter-tab ${activeFilter === 'item' ? 'active' : ''}`}
          onClick={() => setActiveFilter('item')}
        >
          🍽️ Food Reports
        </button>
        <button
          className={`filter-tab ${activeFilter === 'laundry' ? 'active' : ''}`}
          onClick={() => setActiveFilter('laundry')}
        >
          👕 Laundry Reports
        </button>
        <button
          className={`filter-tab ${activeFilter === 'roomitem' ? 'active' : ''}`}
          onClick={() => setActiveFilter('roomitem')}
        >
          📋 Combined Report
        </button>
      </div>

      {/* Report Content */}
      <div className="report-content">
        {activeFilter === 'room' && (
          <div className="room-report">
            <h3>🏨 Room Revenue Report</h3>
            <div className="report-grid">
              {roomRevenueData.map((roomData) => (
                <div
                  key={roomData.room.roomId}
                  className={`report-card clickable ${selectedRoom === roomData.room.roomId ? 'selected' : ''}`}
                  onClick={() => setSelectedRoom(selectedRoom === roomData.room.roomId ? null : roomData.room.roomId)}
                >
                  <div className="card-header">
                    <h4>Room {roomData.room.roomNumber}</h4>
                    <span className="room-type">{roomData.room.roomType}</span>
                  </div>
                  <div className="card-stats">
                    <div className="stat">
                      <span className="stat-label">Bookings:</span>
                      <span className="stat-value">{roomData.invoices.length}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Revenue:</span>
                      <span className="stat-value total-amount">{formatCurrency(roomData.total)}</span>
                    </div>
                  </div>
                  
                  {selectedRoom === roomData.room.roomId && (
                    <div className="detailed-data">
                      <h5>📋 Booking Details:</h5>
                      {roomData.invoices.map((invoice) => (
                        <div key={invoice.invoiceId} className="detail-row">
                          <span className="detail-date">{formatDate(invoice.date)}</span>
                          <span className="detail-guest">
                            {invoice.guestInfo?.name || 'Guest'}
                          </span>
                          <span className="detail-amount">{formatCurrency(invoice.room_price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="section-total">
              <strong>Total Room Revenue: {formatCurrency(roomTotal)}</strong>
            </div>
          </div>
        )}

        {activeFilter === 'item' && (
          <div className="item-report">
            <h3>🍽️ Food Sales Report</h3>
            <div className="report-grid">
              {itemSalesData.map((itemData) => (
                <div
                  key={itemData.item.id}
                  className={`report-card clickable ${selectedItem === itemData.item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedItem(selectedItem === itemData.item.id ? null : itemData.item.id)}
                >
                  <div className="card-header">
                    <h4>{itemData.item.name}</h4>
                    <span className="item-category">{itemData.item.category}</span>
                  </div>
                  <div className="card-stats">
                    <div className="stat">
                      <span className="stat-label">Quantity Sold:</span>
                      <span className="stat-value">{itemData.quantity}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Revenue:</span>
                      <span className="stat-value total-amount">{formatCurrency(itemData.total)}</span>
                    </div>
                  </div>
                  
                  {selectedItem === itemData.item.id && (
                    <div className="detailed-data">
                      <h5>📋 Sales Details:</h5>
                      {itemData.invoices.map((invoice) => {
                        const foodItem = invoice.foodItems?.find((fi: any) => 
                          fi.itemId === itemData.item.id || fi.name === itemData.item.name
                        );
                        return (
                          <div key={invoice.invoiceId} className="detail-row">
                            <span className="detail-date">{formatDate(invoice.date)}</span>
                            <span className="detail-qty">Qty: {foodItem?.quantity || 0}</span>
                            <span className="detail-amount">
                              {formatCurrency((foodItem?.quantity || 0) * (foodItem?.price || 0))}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="section-total">
              <strong>Total Food Revenue: {formatCurrency(foodTotal)}</strong>
            </div>
          </div>
        )}

        {activeFilter === 'laundry' && (
          <div className="laundry-report">
            <h3>👕 Laundry Sales Report</h3>
            <div className="report-grid">
              {laundrySalesData.map((itemData) => (
                <div
                  key={itemData.item.id}
                  className={`report-card clickable ${selectedItem === itemData.item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedItem(selectedItem === itemData.item.id ? null : itemData.item.id)}
                >
                  <div className="card-header">
                    <h4>{itemData.item.name}</h4>
                    <span className="item-category">{itemData.item.category}</span>
                  </div>
                  <div className="card-stats">
                    <div className="stat">
                      <span className="stat-label">Quantity Sold:</span>
                      <span className="stat-value">{itemData.quantity}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Revenue:</span>
                      <span className="stat-value total-amount">{formatCurrency(itemData.total)}</span>
                    </div>
                  </div>
                  
                  {selectedItem === itemData.item.id && (
                    <div className="detailed-data">
                      <h5>📋 Sales Details:</h5>
                      {itemData.invoices.map((invoice) => {
                        const foodItem = invoice.foodItems?.find((fi: any) => 
                          fi.itemId === itemData.item.id || fi.name === itemData.item.name
                        );
                        return (
                          <div key={invoice.invoiceId} className="detail-row">
                            <span className="detail-date">{formatDate(invoice.date)}</span>
                            <span className="detail-qty">Qty: {foodItem?.quantity || 0}</span>
                            <span className="detail-amount">
                              {formatCurrency((foodItem?.quantity || 0) * (foodItem?.price || 0))}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="section-total">
              <strong>Total Laundry Revenue: {formatCurrency(laundryTotal)}</strong>
            </div>
          </div>
        )}

        {activeFilter === 'roomitem' && (
          <div className="combined-report">
            <h3>📋 Combined Revenue Report</h3>
            
            {/* Top performing rooms and items */}
            <div className="combined-grid">
              <div className="combined-section">
                <h4>🏆 Top Performing Rooms</h4>
                {roomRevenueData
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 5)
                  .map((roomData, index) => (
                    <div key={roomData.room.roomId} className="performance-row">
                      <span className="rank">#{index + 1}</span>
                      <span className="name">Room {roomData.room.roomNumber}</span>
                      <span className="amount">{formatCurrency(roomData.total)}</span>
                    </div>
                  ))}
              </div>
              
              <div className="combined-section">
                <h4>🏆 Top Selling Items (Food & Laundry)</h4>
                {getAllItemSalesData()
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 5)
                  .map((itemData, index) => (
                    <div key={itemData.item.id} className="performance-row">
                      <span className="rank">#{index + 1}</span>
                      <span className="name">{itemData.item.name}</span>
                      <span className="item-category">{itemData.item.category === 'Food' ? '🍽️ Food' : '👕 Laundry'}</span>
                      <span className="amount">{formatCurrency(itemData.total)}</span>
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Grand total breakdown */}
            <div className="grand-total-breakdown">
              <h4>💰 Revenue Breakdown</h4>
              <div className="breakdown-chart">
                <div className="breakdown-item">
                  <span className="breakdown-label">Room Revenue</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill room-fill" 
                      style={{width: `${(roomTotal / grandTotal) * 100}%`}}
                    ></div>
                  </div>
                  <span className="breakdown-amount">{formatCurrency(roomTotal)}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Food Revenue</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill item-fill" 
                      style={{width: `${(foodTotal / grandTotal) * 100}%`}}
                    ></div>
                  </div>
                  <span className="breakdown-amount">{formatCurrency(foodTotal)}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Laundry Revenue</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill laundry-fill" 
                      style={{width: `${(laundryTotal / grandTotal) * 100}%`}}
                    ></div>
                  </div>
                  <span className="breakdown-amount">{formatCurrency(laundryTotal)}</span>
                </div>
                <div className="breakdown-total">
                  <strong>Grand Total: {formatCurrency(grandTotal)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDashboard;
