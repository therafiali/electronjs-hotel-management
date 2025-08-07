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
  roomType: string;
  pricePerNight: number;
  nights: number;
}

interface FoodItem {
  name: string;
  quantity: number;
  price: number;
}

interface InvoiceFormProps {
  onSubmit: (invoiceData: any) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSubmit }) => {
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    name: '',
    phone: '',
    address: '',
    checkIn: '',
    checkOut: ''
  });

  const [roomInfo, setRoomInfo] = useState<RoomInfo>({
    roomNumber: '',
    roomType: '',
    pricePerNight: 0,
    nights: 1
  });

  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [newFoodItem, setNewFoodItem] = useState<FoodItem>({
    name: '',
    quantity: 1,
    price: 0
  });

  const [taxRate, setTaxRate] = useState<number>(5);
  const [discount, setDiscount] = useState<number>(0);

  const addFoodItem = () => {
    if (newFoodItem.name && newFoodItem.price > 0) {
      setFoodItems([...foodItems, newFoodItem]);
      setNewFoodItem({ name: '', quantity: 1, price: 0 });
    }
  };

  const removeFoodItem = (index: number) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  const calculateRoomTotal = () => {
    return roomInfo.pricePerNight * roomInfo.nights;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invoiceData = {
      guestInfo,
      roomInfo,
      foodItems,
      taxRate,
      discount,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      date: new Date().toISOString()
    };
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
              <input
                type="text"
                value={roomInfo.roomNumber}
                onChange={(e) => setRoomInfo({...roomInfo, roomNumber: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Room Type:</label>
              <select
                value={roomInfo.roomType}
                onChange={(e) => setRoomInfo({...roomInfo, roomType: e.target.value})}
                required
              >
                <option value="">Select Room Type</option>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Family">Family</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price per Night:</label>
              <input
                type="number"
                value={roomInfo.pricePerNight}
                onChange={(e) => setRoomInfo({...roomInfo, pricePerNight: Number(e.target.value)})}
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Number of Nights:</label>
              <input
                type="number"
                value={roomInfo.nights}
                onChange={(e) => setRoomInfo({...roomInfo, nights: Number(e.target.value)})}
                min="1"
                required
              />
            </div>
          </div>
        </div>

        {/* Food Items */}
        <div className="form-section">
          <h3>Food Orders</h3>
          <div className="food-input-row">
            <div className="form-group">
              <label>Food Item:</label>
              <input
                type="text"
                value={newFoodItem.name}
                onChange={(e) => setNewFoodItem({...newFoodItem, name: e.target.value})}
                placeholder="Enter food item name"
              />
            </div>
            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                value={newFoodItem.quantity}
                onChange={(e) => setNewFoodItem({...newFoodItem, quantity: Number(e.target.value)})}
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Price:</label>
              <input
                type="number"
                value={newFoodItem.price}
                onChange={(e) => setNewFoodItem({...newFoodItem, price: Number(e.target.value)})}
                min="0"
              />
            </div>
            <button type="button" onClick={addFoodItem} className="add-food-btn">
              Add Food Item
            </button>
          </div>

          {/* Food Items List */}
          {foodItems.length > 0 && (
            <div className="food-items-list">
              <h4>Added Food Items:</h4>
              {foodItems.map((item, index) => (
                <div key={index} className="food-item">
                  <span>{item.name} - Qty: {item.quantity} - Price: ${item.price}</span>
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
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                min="0"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Discount Amount:</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
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
            <span>${calculateRoomTotal()}</span>
          </div>
          <div className="summary-row">
            <span>Food Total:</span>
            <span>${calculateFoodTotal()}</span>
          </div>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${calculateSubtotal()}</span>
          </div>
          <div className="summary-row">
            <span>Tax ({taxRate}%):</span>
            <span>${calculateTax()}</span>
          </div>
          <div className="summary-row">
            <span>Discount:</span>
            <span>-${discount}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${calculateTotal()}</span>
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
