import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import EditButton from './EditButton';
const RoomForm = ({ onSubmit, rooms, onRefreshRooms, onUpdateRoomPrice }) => {
    const [roomNumber, setRoomNumber] = useState('');
    const [roomType, setRoomType] = useState('');
    const [price, setPrice] = useState(0);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
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
            }
        }
        catch (error) {
            console.error('Error creating room:', error);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: "items-form", style: { marginBottom: "30px" }, children: [_jsx("h2", { children: "Create Room Type" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-section", children: [_jsx("h3", { children: "Room Information" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Room Number:" }), _jsx("input", { type: "text", value: roomNumber, onChange: (e) => setRoomNumber(e.target.value), placeholder: "Enter room number (e.g., 101, A1, etc.)", required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Room Type:" }), _jsxs("select", { value: roomType, onChange: (e) => setRoomType(e.target.value), required: true, children: [_jsx("option", { value: "", children: "Select Room Type" }), _jsx("option", { value: "Standard", children: "Standard" }), _jsx("option", { value: "Deluxe", children: "Deluxe" }), _jsx("option", { value: "Suite", children: "Suite" }), _jsx("option", { value: "Family", children: "Family" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Price per Night:" }), _jsx("input", { type: "number", value: price || '', onChange: (e) => {
                                                    const value = e.target.value;
                                                    if (value === '') {
                                                        setPrice(0);
                                                    }
                                                    else {
                                                        setPrice(Number(value));
                                                    }
                                                }, onFocus: (e) => e.target.select(), min: "0", step: "0.01", placeholder: "Enter price per night", required: true })] })] }), _jsx("div", { className: "form-actions", children: _jsx("button", { type: "submit", className: "submit-btn", disabled: loading, children: loading ? 'Creating...' : 'Create Room Type' }) })] })] }), _jsxs("div", { className: "items-form", children: [_jsx("h2", { children: "\uD83C\uDFE0 Current Rooms" }), rooms.length === 0 ? (_jsx("div", { style: { textAlign: "center", padding: "20px", color: "#666", background: "#f8f9fa", borderRadius: "8px" }, children: "No rooms found. Create some rooms above!" })) : (_jsx("div", { style: { overflowX: "auto" }, children: _jsxs("table", { style: { width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }, children: [_jsx("thead", { children: _jsxs("tr", { style: { background: "#3498db", color: "white" }, children: [_jsx("th", { style: { padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }, children: "Room Number" }), _jsx("th", { style: { padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }, children: "Room Type" }), _jsx("th", { style: { padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }, children: "Price per Night" }), _jsx("th", { style: { padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }, children: "Created Date" }), _jsx("th", { style: { padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }, children: "Actions" })] }) }), _jsx("tbody", { children: rooms.map((room) => (_jsxs("tr", { style: { borderBottom: "1px solid #eee" }, children: [_jsx("td", { style: { padding: "12px", borderBottom: "1px solid #eee" }, children: room.roomNumber }), _jsx("td", { style: { padding: "12px", borderBottom: "1px solid #eee" }, children: room.roomType }), _jsxs("td", { style: { padding: "12px", borderBottom: "1px solid #eee" }, children: ["Rs. ", room.pricePerNight] }), _jsx("td", { style: { padding: "12px", borderBottom: "1px solid #eee" }, children: new Date(room.createdDate).toLocaleDateString() }), _jsx("td", { style: { padding: "12px", borderBottom: "1px solid #eee" }, children: onUpdateRoomPrice && (_jsx(EditButton, { value: room.pricePerNight, onSave: async (newPrice) => {
                                                        await onUpdateRoomPrice(room.roomId, newPrice);
                                                        onRefreshRooms(); // Refresh to show updated price
                                                    }, fieldType: "number", placeholder: "New price" })) })] }, room.roomId))) })] }) }))] })] }));
};
export default RoomForm;
