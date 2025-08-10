import React, { useState } from 'react';

interface RoomFormProps {
  onSubmit: (roomData: any) => Promise<any>;
}

const RoomForm: React.FC<RoomFormProps> = ({ onSubmit }) => {
  const [roomType, setRoomType] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomType.trim() || price <= 0) {
      alert('Please fill all fields with valid values');
      return;
    }

    setLoading(true);

    const roomData = {
      roomType: roomType.trim(),
      price: price,
      createdDate: new Date().toISOString()
    };

    try {
      const result = await onSubmit(roomData);
      if (result && result.success) {
        // Reset form
        setRoomType('');
        setPrice(0);
        alert('Room type created successfully!');
      }
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="items-form">
      <h2>Create Room Type</h2>
      
      <form onSubmit={handleSubmit}>
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
              <option value="Family">Family</option>
              <option value="Executive">Executive</option>
              <option value="Presidential">Presidential</option>
            </select>
          </div>

          <div className="form-group">
            <label>Price per Night:</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              min="0"
              step="0.01"
              placeholder="Enter price per night"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Room Type'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomForm;

