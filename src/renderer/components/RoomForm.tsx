import React, { useState } from 'react';
import EditButton from './EditButton';

interface RoomFormProps {
  onSubmit: (roomData: any) => Promise<any>;
  rooms: any[];
  onRefreshRooms: () => void;
  onUpdateRoomPrice?: (roomId: string, newPrice: number) => Promise<void>;
}

const RoomForm: React.FC<RoomFormProps> = ({ onSubmit, rooms, onRefreshRooms, onUpdateRoomPrice }) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomNumber.trim() || !roomType.trim() || price <= 0) {
      alert('Please fill all fields with valid values');
      return;
    }

    setLoading(true);

    const roomData = {
      roomNumber: roomNumber.trim(),
      roomType: roomType.trim(),
      price: price,
      createdDate: new Date().toISOString()
    };

    try {
      const result = await onSubmit(roomData);
      if (result && result.success) {
        // Reset form
        setRoomNumber('');
        setRoomType('');
        setPrice(0);
        // Refresh rooms list to show new room
        onRefreshRooms();
        alert('Room type created successfully!');
      }
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Form Card */}
      <div className="items-form" style={{ marginBottom: "30px" }}>
        <h2>Create Room Type</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Room Information</h3>
            
            <div className="form-group">
              <label>Room Number:</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Enter room number (e.g., 101, A1, etc.)"
                required
              />
            </div>

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

      {/* Table Card */}
      <div className="items-form">
        <h2>🏠 Current Rooms</h2>
        {rooms.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#666", background: "#f8f9fa", borderRadius: "8px" }}>
            No rooms found. Create some rooms above!
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
              <thead>
                <tr style={{ background: "#3498db", color: "white" }}>
                                     <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Room Number</th>
                   <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Room Type</th>
                   <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Price per Night</th>
                   <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Created Date</th>
                   <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                                     <tr key={room.roomId} style={{ borderBottom: "1px solid #eee" }}>
                     <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{room.roomNumber}</td>
                     <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{room.roomType}</td>
                     <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>${room.pricePerNight}</td>
                     <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{new Date(room.createdDate).toLocaleDateString()}</td>
                     <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                       {onUpdateRoomPrice && (
                         <EditButton
                           value={room.pricePerNight}
                           onSave={async (newPrice) => {
                             await onUpdateRoomPrice(room.roomId, newPrice as number);
                             onRefreshRooms(); // Refresh to show updated price
                           }}
                           fieldType="number"
                           placeholder="New price"
                         />
                       )}
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomForm;

