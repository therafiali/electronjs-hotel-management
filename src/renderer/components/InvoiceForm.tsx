import React, { useState } from 'react';

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
  const [newFoodItem, setNewFoodItem] = useState<FoodItem>({
    name: '',
    quantity: 1,
    price: 0,
    itemId: ''
  });

  const handleItemSelect = (itemId: string) => {
    const selectedItem = items.find(item => item.id === itemId);
    if (selectedItem) {
      setNewFoodItem({
        name: selectedItem.name,
        quantity: 1,
        price: selectedItem.price,
        itemId: selectedItem.id  // Store itemId for foreign key
      });
    }
  };

  const [taxRate, setTaxRate] = useState<number>(5);
  const [discount, setDiscount] = useState<number>(0);

  const addFoodItem = () => {
    if (newFoodItem.name && newFoodItem.price > 0 && newFoodItem.itemId) {
      setFoodItems([...foodItems, newFoodItem]);
      setNewFoodItem({ name: '', quantity: 1, price: 0, itemId: '' });
    }
  };

  const removeFoodItem = (index: number) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  const calculateRoomTotal = () => {
    const selectedRoom = rooms.find(room => room.roomNumber === roomInfo.roomNumber);
    return selectedRoom ? selectedRoom.pricePerNight * roomInfo.nights : 0;
  };

  const calculateFoodTotal = () => {
    return foodItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateSubtotal = () => {
    return calculateRoomTotal() + calculateFoodTotal();
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
    const selectedRoom = rooms.find(room => room.roomNumber === roomInfo.roomNumber);
    
    // Validate required fields
    if (!guestInfo.name.trim()) {
      alert('Please enter guest name');
      return;
    }
    
    if (!selectedRoom) {
      alert('Please select a room');
      return;
    }
    
    const invoiceData = {
      invoiceId: generateUniqueId(), // Add unique ID
      guestInfo,
      roomInfo: selectedRoom.roomId,  // Store room ID directly
      foodItems,
      taxRate,
      discount,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      date: new Date().toISOString(),
      room_id: selectedRoom.roomId,       // Foreign key to rooms table
      room_price: selectedRoom.pricePerNight
    };
    
    console.log('🏨 Invoice created with room foreign key:', {
      room_id: selectedRoom.roomId,
      roomType: selectedRoom.roomType,
      room_price: selectedRoom.pricePerNight
    });
    
    onSubmit(invoiceData);
  };

  return (
    <div className="invoice-form">
      <h2>Create New Invoice</h2>
      
      <form onSubmit={handleSubmit}>
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
          <div className="form-group">
            <label>Address:</label>
            <textarea
              value={guestInfo.address}
              onChange={(e) => setGuestInfo({...guestInfo, address: e.target.value})}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Check-in Date:</label>
              <input
                type="date"
                value={guestInfo.checkIn}
                onChange={(e) => setGuestInfo({...guestInfo, checkIn: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Check-out Date:</label>
              <input
                type="date"
                value={guestInfo.checkOut}
                onChange={(e) => setGuestInfo({...guestInfo, checkOut: e.target.value})}
                required
              />
            </div>
          </div>
        </div>

        {/* Room Information */}
        <div className="form-section">
          <h3>Room Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Room Number:</label>
              <select
                value={roomInfo.roomNumber}
                onChange={(e) => setRoomInfo({...roomInfo, roomNumber: e.target.value})}
                required
              >
                <option value="">Select Room</option>
                {rooms.map(room => (
                  <option key={room.roomId} value={room.roomNumber}>
                    {room.roomNumber} - Rs. {room.pricePerNight}/night
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Number of Nights:</label>
              <input
                type="number"
                value={roomInfo.nights || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setRoomInfo({...roomInfo, nights: 0});
                  } else {
                    setRoomInfo({...roomInfo, nights: Number(value)});
                  }
                }}
                onFocus={(e) => e.target.select()}
                min="1"
                required
              />
            </div>
          </div>
          {roomInfo.roomNumber && (
            <div className="room-info-display">
              <p>Selected Room: {roomInfo.roomNumber}</p>
                              <p>Price per Night: Rs. {rooms.find(r => r.roomNumber === roomInfo.roomNumber)?.pricePerNight || 0}</p>
                              <p>Room Total: Rs. {calculateRoomTotal()}</p>
            </div>
          )}
        </div>

        {/* Food Items */}
        <div className="form-section">
          <h3>Food Orders</h3>
          <div className="food-input-row">
            <div className="form-group">
              <label>Food Item:</label>
              <select
                value=""
                onChange={(e) => handleItemSelect(e.target.value)}
              >
                <option value="">Select Food Item</option>
                {items.map(item => (
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
              Add Food Item
            </button>
          </div>
          
          {/* Food Item Info Display */}
          {newFoodItem.name && (
            <div className="room-info-display">
              <p>Selected Item: {newFoodItem.name}</p>
                              <p>Price per Item: Rs. {newFoodItem.price}</p>
                              <p>Item Total: Rs. {newFoodItem.price * newFoodItem.quantity}</p>
            </div>
          )}

          {/* Food Items List */}
          {foodItems.length > 0 && (
            <div className="food-items-list">
              <h4>Added Food Items:</h4>
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
          <div className="summary-row">
            <span>Room Total:</span>
                            <span>Rs. {calculateRoomTotal()}</span>
          </div>
          <div className="summary-row">
            <span>Food Total:</span>
                            <span>Rs. {calculateFoodTotal()}</span>
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
