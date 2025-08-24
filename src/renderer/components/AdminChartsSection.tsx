import React, { useState, useEffect, useMemo } from 'react';
import { 
  Analytics, 
  Hotel, 
  Restaurant, 
  Assessment,
  TrendingUp,
  PieChart,
  BarChart,
  Star
} from '@mui/icons-material';

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

interface AdminChartsSectionProps {
  invoices: Invoice[];
  rooms: Room[];
  items: Item[];
}

const AdminChartsSection: React.FC<AdminChartsSectionProps> = ({ invoices, rooms, items }) => {
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d'>('30d');

  // Filter invoices by time period
  const getFilteredInvoices = () => {
    const now = new Date();
    const daysBack = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    return invoices.filter(invoice => new Date(invoice.date) >= cutoffDate);
  };

  // Revenue Trend Chart Removed as per user request

  // Room vs Food vs Laundry Revenue Distribution
  const getRevenueDistribution = () => {
    const filteredInvoices = getFilteredInvoices();
    
    // Get the same cutoff date used in filtering
    const now = new Date();
    const daysBack = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    const roomRevenue = filteredInvoices.reduce((sum, inv) => {
      if (inv.room_id && inv.guestInfo?.checkIn && inv.guestInfo?.checkOut) {
        const checkIn = new Date(inv.guestInfo.checkIn);
        const checkOut = new Date(inv.guestInfo.checkOut);
        
        // Calculate only the nights that fall within the filtered period
        const effectiveCheckIn = checkIn > cutoffDate ? checkIn : cutoffDate;
        const effectiveCheckOut = checkOut < now ? checkOut : now;
        
        // Only calculate revenue if there's overlap with the filtered period
        if (effectiveCheckIn < effectiveCheckOut) {
          const nightsInPeriod = Math.ceil(Math.abs(effectiveCheckOut.getTime() - effectiveCheckIn.getTime()) / (1000 * 60 * 60 * 24));
          return sum + ((inv.room_price || 0) * (nightsInPeriod > 0 ? nightsInPeriod : 1));
        }
      }
      return sum;
    }, 0);
    
    const foodRevenue = filteredInvoices.reduce((sum, inv) => {
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
    
    const laundryRevenue = filteredInvoices.reduce((sum, inv) => {
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
    
    const total = roomRevenue + foodRevenue + laundryRevenue;
    
    return {
      room: { amount: roomRevenue, percentage: total > 0 ? (roomRevenue / total) * 100 : 0 },
      food: { amount: foodRevenue, percentage: total > 0 ? (foodRevenue / total) * 100 : 0 },
      laundry: { amount: laundryRevenue, percentage: total > 0 ? (laundryRevenue / total) * 100 : 0 },
      total
    };
  };

  // Room Occupancy Data
  const getRoomOccupancyData = () => {
    const filteredInvoices = getFilteredInvoices();
    const now = new Date();
    const daysBack = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    const roomOccupancy: { [key: string]: number } = {};
    
    filteredInvoices.forEach(invoice => {
      if (invoice.room_id && invoice.guestInfo?.checkIn && invoice.guestInfo?.checkOut) {
        const checkIn = new Date(invoice.guestInfo.checkIn);
        const checkOut = new Date(invoice.guestInfo.checkOut);
        
        // Calculate nights that fall within the filtered period
        const effectiveCheckIn = checkIn > cutoffDate ? checkIn : cutoffDate;
        const effectiveCheckOut = checkOut < now ? checkOut : now;
        
        if (effectiveCheckIn < effectiveCheckOut) {
          const nightsInPeriod = Math.ceil(Math.abs(effectiveCheckOut.getTime() - effectiveCheckIn.getTime()) / (1000 * 60 * 60 * 24));
          roomOccupancy[invoice.room_id] = (roomOccupancy[invoice.room_id] || 0) + nightsInPeriod;
        }
      }
    });
    
    return rooms.map(room => ({
      ...room,
      bookings: roomOccupancy[room.roomId] || 0, // Nights occupied for this room
      occupancyRate: roomOccupancy[room.roomId] ? 
        Math.min((roomOccupancy[room.roomId] / daysBack) * 100, 100) : 0
    }));
  };

  // Top Performing Items (Food + Laundry)
  const getTopItems = () => {
    const filteredInvoices = getFilteredInvoices();
    const itemSales: { [key: string]: { quantity: number; revenue: number; name: string; category: string } } = {};
    
    filteredInvoices.forEach(invoice => {
      if (invoice.foodItems && Array.isArray(invoice.foodItems)) {
        invoice.foodItems.forEach((foodItem: any) => {
          const itemId = foodItem.itemId || foodItem.name;
          const itemData = items.find(i => i.id === foodItem.itemId || i.name === foodItem.name);
          if (itemData) {
            if (!itemSales[itemId]) {
              itemSales[itemId] = { 
                quantity: 0, 
                revenue: 0, 
                name: foodItem.name,
                category: itemData.category
              };
            }
            itemSales[itemId].quantity += foodItem.quantity || 0;
            itemSales[itemId].revenue += (foodItem.quantity || 0) * (foodItem.price || 0);
          }
        });
      }
    });
    
    return Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  // Recalculate data when timeFilter changes
  const revenueDistribution = useMemo(() => {
    const result = getRevenueDistribution();
    console.log(`Revenue distribution for ${timeFilter}:`, result);
    return result;
  }, [timeFilter, invoices, items]);
  
  const occupancyData = useMemo(() => {
    const result = getRoomOccupancyData();
    console.log(`Occupancy data for ${timeFilter}:`, result);
    return result;
  }, [timeFilter, invoices, rooms]);
  
  const topItems = useMemo(() => {
    const result = getTopItems();
    console.log(`Top items for ${timeFilter}:`, result);
    return result;
  }, [timeFilter, invoices, items]);

  return (
    <div className="admin-charts-section">
      <div className="charts-header">
        <h2>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '8px 16px',
            marginRight: '16px',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}>
            <Analytics style={{ color: 'white', fontSize: '24px' }} />
          </div>
          Analytics Dashboard
        </h2>
        <div className="time-filter">
          <button 
            className={timeFilter === '7d' ? 'active' : ''}
            onClick={() => {
              console.log('Setting filter to 7 days');
              setTimeFilter('7d');
            }}
          >
            7 Days
          </button>
          <button 
            className={timeFilter === '30d' ? 'active' : ''}
            onClick={() => {
              console.log('Setting filter to 30 days');
              setTimeFilter('30d');
            }}
          >
            30 Days
          </button>
          <button 
            className={timeFilter === '90d' ? 'active' : ''}
            onClick={() => {
              console.log('Setting filter to 90 days');
              setTimeFilter('90d');
            }}
          >
            90 Days
          </button>
        </div>
      </div>

      <div className="charts-grid">
        {/* Revenue Distribution Pie Chart */}
        {revenueDistribution.total > 0 && (
          <div className="chart-card revenue-distribution">
            <h3>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '10px',
                padding: '6px 12px',
                marginRight: '12px',
                boxShadow: '0 3px 12px rgba(240, 147, 251, 0.3)'
              }}>
                <PieChart style={{ color: 'white', fontSize: '20px' }} />
              </div>
              Revenue Distribution
            </h3>
            <div className="pie-chart">
              <div className="pie-container">
                <svg width="150" height="150" viewBox="0 0 150 150">
                  <circle
                    cx="75"
                    cy="75"
                    r="60"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="20"
                    strokeDasharray={`${(revenueDistribution.room.percentage / 100) * 377} 377`}
                    strokeDashoffset="0"
                    transform="rotate(-90 75 75)"
                  />
                  <circle
                    cx="75"
                    cy="75"
                    r="60"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="20"
                    strokeDasharray={`${(revenueDistribution.food.percentage / 100) * 377} 377`}
                    strokeDashoffset={`-${(revenueDistribution.room.percentage / 100) * 377}`}
                    transform="rotate(-90 75 75)"
                  />
                  <circle
                    cx="75"
                    cy="75"
                    r="60"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="20"
                    strokeDasharray={`${(revenueDistribution.laundry.percentage / 100) * 377} 377`}
                    strokeDashoffset={`-${((revenueDistribution.room.percentage + revenueDistribution.food.percentage) / 100) * 377}`}
                    transform="rotate(-90 75 75)"
                  />
                </svg>
              </div>
              <div className="pie-legend">
                <div className="legend-item">
                  <span className="legend-color room-color"></span>
                  <span>Rooms: {formatCurrency(revenueDistribution.room.amount)}</span>
                  <span className="percentage">({revenueDistribution.room.percentage.toFixed(1)}%)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color food-color"></span>
                  <span>Food: {formatCurrency(revenueDistribution.food.amount)}</span>
                  <span className="percentage">({revenueDistribution.food.percentage.toFixed(1)}%)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color laundry-color"></span>
                  <span>Laundry: {formatCurrency(revenueDistribution.laundry.amount)}</span>
                  <span className="percentage">({revenueDistribution.laundry.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Room Occupancy Chart */}
        {rooms.length > 0 && (
          <div className="chart-card room-occupancy">
            <h3>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '10px',
                padding: '6px 12px',
                marginRight: '12px',
                boxShadow: '0 3px 12px rgba(79, 172, 254, 0.3)'
              }}>
                <Hotel style={{ color: 'white', fontSize: '20px' }} />
              </div>
              Room Occupancy Rate
            </h3>
            <div className="bar-chart-container">
              <div className="bar-chart">
                {occupancyData.map((room, index) => (
                  <div key={room.roomId} className="occupancy-bar">
                    <div className="bar-container">
                      <div 
                        className="occupancy-fill"
                        style={{ height: `${room.occupancyRate}%` }}
                      />
                      <span className="occupancy-percentage">{room.occupancyRate.toFixed(0)}%</span>
                    </div>
                    <span className="room-label">Room {room.roomNumber}</span>
                    <span className="booking-count">{room.bookings} bookings</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Selling Items */}
        {topItems.length > 0 && (
          <div className="chart-card top-items">
            <h3>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                borderRadius: '10px',
                padding: '6px 12px',
                marginRight: '12px',
                boxShadow: '0 3px 12px rgba(250, 112, 154, 0.3)'
              }}>
                <Star style={{ color: 'white', fontSize: '20px' }} />
              </div>
              Top Selling Items
            </h3>
            <div className="items-chart">
              {topItems.map((item, index) => (
                <div key={index} className="item-bar">
                  <div className="item-info">
                    <span className="item-rank">#{index + 1}</span>
                    <span className="item-name">{item.name}</span>
                    <span className="item-category">{item.category}</span>
                  </div>
                  <div className="item-stats">
                    <div className="item-revenue">{formatCurrency(item.revenue)}</div>
                    <div className="item-quantity">Qty: {item.quantity}</div>
                  </div>
                  <div className="item-progress">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${topItems.length > 0 ? (item.revenue / topItems[0].revenue) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChartsSection;
