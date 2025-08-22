import React, { useState } from 'react';
import { formatInvoiceIdForDisplay } from '../utils/invoiceUtils';

interface GuestInfo {
  name: string;
  phone: string;
  address: string;
  checkIn: string;
  checkOut: string;
}

interface RoomInfo {
  roomNumber: string;
  nights: number;
}

interface Room {
  roomId: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
}

interface FoodItem {
  name: string;
  quantity: number;
  price: number;
  itemId?: string;  // Add itemId for foreign key reference
  category?: string; // Add category to distinguish food vs laundry
}

interface Item {
  id: string;
  name: string;
  item_name: string;
  category: string;
  price: number;
  createdDate: string;
}

interface InvoiceFormProps {
  onSubmit: (invoiceData: any) => void;
  rooms: Room[];
  items: Item[];
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSubmit, rooms, items }) => {
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    name: '',
    phone: '',
    address: '',
    checkIn: '',
    checkOut: ''
  });

  const [roomInfo, setRoomInfo] = useState<RoomInfo>({
    roomNumber: '',
    nights: 1
  });

  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [laundryItems, setLaundryItems] = useState<FoodItem[]>([]);
  const [newFoodItem, setNewFoodItem] = useState<FoodItem>({
    name: '',
    quantity: 1,
    price: 0,
    itemId: '',
    category: ''
  });

  // Add stay option state
  const [withStay, setWithStay] = useState<boolean>(true);

  const handleItemSelect = (itemId: string) => {
    const selectedItem = items.find(item => item.id === itemId);
    if (selectedItem) {
      setNewFoodItem({
        name: selectedItem.name,
        quantity: 1,
        price: selectedItem.price,
        itemId: selectedItem.id,  // Store itemId for foreign key
        category: selectedItem.category  // Store category
      });
    }
  };

  const [taxRate, setTaxRate] = useState<number>(5);
  const [discount, setDiscount] = useState<number>(0);

  const addFoodItem = () => {
    if (newFoodItem.name && newFoodItem.price > 0 && newFoodItem.itemId) {
      if (newFoodItem.category === 'Laundry') {
        setLaundryItems([...laundryItems, newFoodItem]);
      } else {
        setFoodItems([...foodItems, newFoodItem]);
      }
      setNewFoodItem({ name: '', quantity: 1, price: 0, itemId: '', category: '' });
    }
  };

  const removeFoodItem = (index: number) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  const removeLaundryItem = (index: number) => {
    setLaundryItems(laundryItems.filter((_, i) => i !== index));
  };

  // Calculate nights from check-in and check-out dates
  const calculateNights = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 1;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 1;
  };

  // Update nights when check-in or check-out changes
  const handleDateChange = (field: 'checkIn' | 'checkOut', value: string) => {
    const newGuestInfo = { ...guestInfo, [field]: value };
    setGuestInfo(newGuestInfo);
    
    // Auto-calculate nights
    const calculatedNights = calculateNights(newGuestInfo.checkIn, newGuestInfo.checkOut);
    setRoomInfo({ ...roomInfo, nights: calculatedNights });
  };

  const calculateRoomTotal = () => {
    if (!withStay) return 0; // No room charge if no stay
    const selectedRoom = rooms.find(room => room.roomNumber === roomInfo.roomNumber);
    return selectedRoom ? selectedRoom.pricePerNight * roomInfo.nights : 0;
  };

  const calculateFoodTotal = () => {
    return foodItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateLaundryTotal = () => {
    return laundryItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateSubtotal = () => {
    return calculateRoomTotal() + calculateFoodTotal() + calculateLaundryTotal();
  };

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - discount;
  };

  // Generate unique ID for each invoice
  const generateUniqueId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `invoice_${timestamp}_${random}`;
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!guestInfo.name.trim()) {
      alert('Please enter guest name');
      return;
    }

    if (withStay) {
      // Validate room selection only if staying
      if (!roomInfo.roomNumber) {
        alert('Please select a room');
        return;
      }
      if (!guestInfo.checkIn || !guestInfo.checkOut) {
        alert('Please select both check-in and check-out dates');
        return;
      }
      if (roomInfo.nights < 1) {
        alert('Check-out date must be after check-in date');
        return;
      }
    }
    
    const selectedRoom = withStay ? rooms.find(room => room.roomNumber === roomInfo.roomNumber) : null;
    
    const invoiceData = {
      invoiceId: generateUniqueId(),
      guestInfo: withStay ? guestInfo : { ...guestInfo, checkIn: '', checkOut: '' },
      roomInfo: withStay ? selectedRoom?.roomId : null,
      foodItems: [...foodItems, ...laundryItems], // Combine both food and laundry items
      taxRate,
      discount,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      date: new Date().toISOString(),
      room_id: withStay ? selectedRoom?.roomId : null,
      room_price: withStay ? (selectedRoom?.pricePerNight || 0) : 0
    };
    
    console.log('🏨 Invoice created:', {
      withStay,
      room_id: invoiceData.room_id,
      room_price: invoiceData.room_price,
      nights: withStay ? roomInfo.nights : 0
    });
    
    onSubmit(invoiceData);
  };

  return (
    <div className="invoice-form">
      <h2>Create New Invoice</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Stay Option Toggle */}
        <div className="form-section">
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={withStay}
                onChange={(e) => setWithStay(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              ☑️ With Stay (Room + Food)
            </label>
            <p style={{ margin: '8px 0 0 26px', fontSize: '14px', color: '#6b7280' }}>
              {withStay ? 'Customer will stay in a room' : 'Customer only wants food (no room)'}
            </p>
          </div>
        </div>

        {/* Guest Information */}
        <div className="form-section">
          <h3>Guest Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Guest Name:</label>
              <input
                type="text"
                value={guestInfo.name}
                onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                required
              />
            </div>
          </div>
          {withStay && (
            <div className="form-row">
              <div className="form-group">
                <label>Check-in Date:</label>
                <input
                  type="date"
                  value={guestInfo.checkIn}
                  onChange={(e) => handleDateChange('checkIn', e.target.value)}
                  required={withStay}
                />
              </div>
              <div className="form-group">
                <label>Check-out Date:</label>
                <input
                  type="date"
                  value={guestInfo.checkOut}
                  onChange={(e) => handleDateChange('checkOut', e.target.value)}
                  required={withStay}
                />
              </div>
            </div>
          )}
        </div>

        {/* Room Information - Only show if withStay */}
        {withStay && (
          <div className="form-section">
            <h3>Room Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Room Number:</label>
                <select
                  value={roomInfo.roomNumber}
                  onChange={(e) => setRoomInfo({...roomInfo, roomNumber: e.target.value})}
                  required={withStay}
                >
                  <option value="">Select Room</option>
                  {rooms.map(room => (
                    <option key={room.roomId} value={room.roomNumber}>
                      {room.roomNumber} - Rs. {room.pricePerNight}/night
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {roomInfo.roomNumber && (
              <div className="room-info-display">
                <p>Selected Room: {roomInfo.roomNumber}</p>
                <p>Price per Night: Rs. {rooms.find(r => r.roomNumber === roomInfo.roomNumber)?.pricePerNight || 0}</p>
                <p>Number of Nights: {roomInfo.nights}</p>
                <p>Room Total: Rs. {calculateRoomTotal()}</p>
              </div>
            )}
          </div>
        )}

        {/* Food Items */}
        <div className="form-section">
          <h3>Food & Beverages</h3>
          <div className="food-input-row">
            <div className="form-group">
              <label>Food/Beverage Item:</label>
              <select
                value=""
                onChange={(e) => handleItemSelect(e.target.value)}
              >
                <option value="">Select Food/Beverage Item</option>
                {items.filter(item => item.category === 'Food').map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - Rs. {item.price}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                value={newFoodItem.quantity || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setNewFoodItem({...newFoodItem, quantity: 0});
                  } else {
                    setNewFoodItem({...newFoodItem, quantity: Number(value)});
                  }
                }}
                onFocus={(e) => e.target.select()}
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Price:</label>
              <input
                type="number"
                value={newFoodItem.price || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setNewFoodItem({...newFoodItem, price: 0});
                  } else {
                    setNewFoodItem({...newFoodItem, price: Number(value)});
                  }
                }}
                onFocus={(e) => e.target.select()}
                min="0"
                readOnly
              />
            </div>
            <button type="button" onClick={addFoodItem} className="add-food-btn">
              Add Food/Beverage Item
            </button>
          </div>
          
          {/* Food Item Info Display */}
          {newFoodItem.name && newFoodItem.category === 'Food' && (
            <div className="room-info-display">
              <p>Selected Item: {newFoodItem.name}</p>
              <p>Price per Item: Rs. {newFoodItem.price}</p>
              <p>Item Total: Rs. {newFoodItem.price * newFoodItem.quantity}</p>
            </div>
          )}

          {/* Food Items List */}
          {foodItems.length > 0 && (
            <div className="food-items-list">
              <h4>Added Food & Beverage Items:</h4>
              {foodItems.map((item, index) => (
                <div key={index} className="food-item">
                  <span>{item.name} - Qty: {item.quantity} - Price: Rs. {item.price}</span>
                  <button type="button" onClick={() => removeFoodItem(index)} className="remove-btn">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Laundry Items */}
        <div className="form-section">
          <h3>Laundry Services</h3>
          <div className="food-input-row">
            <div className="form-group">
              <label>Laundry Item:</label>
              <select
                value=""
                onChange={(e) => handleItemSelect(e.target.value)}
              >
                <option value="">Select Laundry Item</option>
                {items.filter(item => item.category === 'Laundry').map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - Rs. {item.price}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                value={newFoodItem.quantity || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setNewFoodItem({...newFoodItem, quantity: 0});
                  } else {
                    setNewFoodItem({...newFoodItem, quantity: Number(value)});
                  }
                }}
                onFocus={(e) => e.target.select()}
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Price:</label>
              <input
                type="number"
                value={newFoodItem.price || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setNewFoodItem({...newFoodItem, price: 0});
                  } else {
                    setNewFoodItem({...newFoodItem, price: Number(value)});
                  }
                }}
                onFocus={(e) => e.target.select()}
                min="0"
                readOnly
              />
            </div>
            <button type="button" onClick={addFoodItem} className="add-food-btn">
              Add Laundry Item
            </button>
          </div>
          
          {/* Laundry Item Info Display */}
          {newFoodItem.name && newFoodItem.category === 'Laundry' && (
            <div className="room-info-display">
              <p>Selected Item: {newFoodItem.name}</p>
              <p>Price per Item: Rs. {newFoodItem.price}</p>
              <p>Item Total: Rs. {newFoodItem.price * newFoodItem.quantity}</p>
            </div>
          )}

          {/* Laundry Items List */}
          {laundryItems.length > 0 && (
            <div className="food-items-list">
              <h4>Added Laundry Items:</h4>
              {laundryItems.map((item, index) => (
                <div key={index} className="food-item">
                  <span>{item.name} - Qty: {item.quantity} - Price: Rs. {item.price}</span>
                  <button type="button" onClick={() => removeLaundryItem(index)} className="remove-btn">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="form-section">
          <h3>Pricing</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Tax Rate (%):</label>
              <input
                type="number"
                value={taxRate || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setTaxRate(0);
                  } else {
                    setTaxRate(Number(value));
                  }
                }}
                onFocus={(e) => e.target.select()}
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Discount Amount:</label>
              <input
                type="number"
                value={discount || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setDiscount(0);
                  } else {
                    setDiscount(Number(value));
                  }
                }}
                onFocus={(e) => e.target.select()}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="form-section summary">
          <h3>Invoice Summary</h3>
          {withStay && (
            <div className="summary-row">
              <span>Room Total:</span>
              <span>Rs. {calculateRoomTotal()}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Food & Beverages Total:</span>
            <span>Rs. {calculateFoodTotal()}</span>
          </div>
          <div className="summary-row">
            <span>Laundry Total:</span>
            <span>Rs. {calculateLaundryTotal()}</span>
          </div>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>Rs. {calculateSubtotal()}</span>
          </div>
          <div className="summary-row">
            <span>Tax ({taxRate}%):</span>
            <span>Rs. {calculateTax()}</span>
          </div>
          <div className="summary-row">
            <span>Discount:</span>
            <span>-Rs. {discount}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>Rs. {calculateTotal()}</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
