import React, { useState } from 'react';

interface AddRoomProps {
  onSubmit: (roomData: any) => void;
  onBack: () => void;
}

const AddRoom: React.FC<AddRoomProps> = ({ onSubmit, onBack }) => {
  const [roomType, setRoomType] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [roomNumber, setRoomNumber] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roomData = {
      id: `room_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      roomType,
      price,
      roomNumber,
      date: new Date().toISOString()
    };
    onSubmit(roomData);
  };

  return (
    <div className="add-room">
      <div className="add-room-header">
        <h2>🏨 Add New Room</h2>
        <p>Enter room details to add to the system</p>
      </div>

      <form onSubmit={handleSubmit} className="add-room-form">
        <div className="form-section">
          <h3>Room Information</h3>
          
          <div className="form-group">
            <label>Room Type:</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              required
            >
              <option value="">Select Room Type</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
            </select>
          </div>

          <div className="form-group">
            <label>Price per Night:</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min="0"
              required
              placeholder="Enter price"
            />
          </div>

          <div className="form-group">
            <label>Room Number:</label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              required
              placeholder="Enter room number"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="back-btn">
            ← Back to Dashboard
          </button>
          <button type="submit" className="submit-btn">
            Add Room
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRoom;
