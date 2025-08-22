import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const InvoiceForm = ({ onSubmit, rooms, items }) => {
    const [guestInfo, setGuestInfo] = useState({
        name: '',
        phone: '',
        address: '',
        checkIn: '',
        checkOut: ''
    });
    const [roomInfo, setRoomInfo] = useState({
        roomNumber: '',
        nights: 1
    });
    const [foodItems, setFoodItems] = useState([]);
    const [newFoodItem, setNewFoodItem] = useState({
        name: '',
        quantity: 1,
        price: 0,
        itemId: ''
    });
    // Add stay option state
    const [withStay, setWithStay] = useState(true);
    const handleItemSelect = (itemId) => {
        const selectedItem = items.find(item => item.id === itemId);
        if (selectedItem) {
            setNewFoodItem({
                name: selectedItem.name,
                quantity: 1,
                price: selectedItem.price,
                itemId: selectedItem.id // Store itemId for foreign key
            });
        }
    };
    const [taxRate, setTaxRate] = useState(5);
    const [discount, setDiscount] = useState(0);
    const addFoodItem = () => {
        if (newFoodItem.name && newFoodItem.price > 0 && newFoodItem.itemId) {
            setFoodItems([...foodItems, newFoodItem]);
            setNewFoodItem({ name: '', quantity: 1, price: 0, itemId: '' });
        }
    };
    const removeFoodItem = (index) => {
        setFoodItems(foodItems.filter((_, i) => i !== index));
    };
    // Calculate nights from check-in and check-out dates
    const calculateNights = (checkIn, checkOut) => {
        if (!checkIn || !checkOut)
            return 1;
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 1;
    };
    // Update nights when check-in or check-out changes
    const handleDateChange = (field, value) => {
        const newGuestInfo = { ...guestInfo, [field]: value };
        setGuestInfo(newGuestInfo);
        // Auto-calculate nights
        const calculatedNights = calculateNights(newGuestInfo.checkIn, newGuestInfo.checkOut);
        setRoomInfo({ ...roomInfo, nights: calculatedNights });
    };
    const calculateRoomTotal = () => {
        if (!withStay)
            return 0; // No room charge if no stay
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
    const handleSubmit = (e) => {
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
            foodItems,
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
    return (_jsxs("div", { className: "invoice-form", children: [_jsx("h2", { children: "Create New Invoice" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx("div", { className: "form-section", children: _jsxs("div", { className: "form-group", children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: withStay, onChange: (e) => setWithStay(e.target.checked), style: { width: '18px', height: '18px' } }), "\u2611\uFE0F With Stay (Room + Food)"] }), _jsx("p", { style: { margin: '8px 0 0 26px', fontSize: '14px', color: '#6b7280' }, children: withStay ? 'Customer will stay in a room' : 'Customer only wants food (no room)' })] }) }), _jsxs("div", { className: "form-section", children: [_jsx("h3", { children: "Guest Information" }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Guest Name:" }), _jsx("input", { type: "text", value: guestInfo.name, onChange: (e) => setGuestInfo({ ...guestInfo, name: e.target.value }), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Phone:" }), _jsx("input", { type: "tel", value: guestInfo.phone, onChange: (e) => setGuestInfo({ ...guestInfo, phone: e.target.value }), required: true })] })] }), withStay && (_jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Check-in Date:" }), _jsx("input", { type: "date", value: guestInfo.checkIn, onChange: (e) => handleDateChange('checkIn', e.target.value), required: withStay })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Check-out Date:" }), _jsx("input", { type: "date", value: guestInfo.checkOut, onChange: (e) => handleDateChange('checkOut', e.target.value), required: withStay })] })] }))] }), withStay && (_jsxs("div", { className: "form-section", children: [_jsx("h3", { children: "Room Information" }), _jsx("div", { className: "form-row", children: _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Room Number:" }), _jsxs("select", { value: roomInfo.roomNumber, onChange: (e) => setRoomInfo({ ...roomInfo, roomNumber: e.target.value }), required: withStay, children: [_jsx("option", { value: "", children: "Select Room" }), rooms.map(room => (_jsxs("option", { value: room.roomNumber, children: [room.roomNumber, " - Rs. ", room.pricePerNight, "/night"] }, room.roomId)))] })] }) }), roomInfo.roomNumber && (_jsxs("div", { className: "room-info-display", children: [_jsxs("p", { children: ["Selected Room: ", roomInfo.roomNumber] }), _jsxs("p", { children: ["Price per Night: Rs. ", rooms.find(r => r.roomNumber === roomInfo.roomNumber)?.pricePerNight || 0] }), _jsxs("p", { children: ["Number of Nights: ", roomInfo.nights] }), _jsxs("p", { children: ["Room Total: Rs. ", calculateRoomTotal()] })] }))] })), _jsxs("div", { className: "form-section", children: [_jsx("h3", { children: "Food Orders" }), _jsxs("div", { className: "food-input-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Food Item:" }), _jsxs("select", { value: "", onChange: (e) => handleItemSelect(e.target.value), children: [_jsx("option", { value: "", children: "Select Food Item" }), items.map(item => (_jsxs("option", { value: item.id, children: [item.name, " - Rs. ", item.price] }, item.id)))] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Quantity:" }), _jsx("input", { type: "number", value: newFoodItem.quantity || '', onChange: (e) => {
                                                    const value = e.target.value;
                                                    if (value === '') {
                                                        setNewFoodItem({ ...newFoodItem, quantity: 0 });
                                                    }
                                                    else {
                                                        setNewFoodItem({ ...newFoodItem, quantity: Number(value) });
                                                    }
                                                }, onFocus: (e) => e.target.select(), min: "1" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Price:" }), _jsx("input", { type: "number", value: newFoodItem.price || '', onChange: (e) => {
                                                    const value = e.target.value;
                                                    if (value === '') {
                                                        setNewFoodItem({ ...newFoodItem, price: 0 });
                                                    }
                                                    else {
                                                        setNewFoodItem({ ...newFoodItem, price: Number(value) });
                                                    }
                                                }, onFocus: (e) => e.target.select(), min: "0", readOnly: true })] }), _jsx("button", { type: "button", onClick: addFoodItem, className: "add-food-btn", children: "Add Food Item" })] }), newFoodItem.name && (_jsxs("div", { className: "room-info-display", children: [_jsxs("p", { children: ["Selected Item: ", newFoodItem.name] }), _jsxs("p", { children: ["Price per Item: Rs. ", newFoodItem.price] }), _jsxs("p", { children: ["Item Total: Rs. ", newFoodItem.price * newFoodItem.quantity] })] })), foodItems.length > 0 && (_jsxs("div", { className: "food-items-list", children: [_jsx("h4", { children: "Added Food Items:" }), foodItems.map((item, index) => (_jsxs("div", { className: "food-item", children: [_jsxs("span", { children: [item.name, " - Qty: ", item.quantity, " - Price: Rs. ", item.price] }), _jsx("button", { type: "button", onClick: () => removeFoodItem(index), className: "remove-btn", children: "Remove" })] }, index)))] }))] }), _jsxs("div", { className: "form-section", children: [_jsx("h3", { children: "Pricing" }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Tax Rate (%):" }), _jsx("input", { type: "number", value: taxRate || '', onChange: (e) => {
                                                    const value = e.target.value;
                                                    if (value === '') {
                                                        setTaxRate(0);
                                                    }
                                                    else {
                                                        setTaxRate(Number(value));
                                                    }
                                                }, onFocus: (e) => e.target.select(), min: "0", max: "100" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Discount Amount:" }), _jsx("input", { type: "number", value: discount || '', onChange: (e) => {
                                                    const value = e.target.value;
                                                    if (value === '') {
                                                        setDiscount(0);
                                                    }
                                                    else {
                                                        setDiscount(Number(value));
                                                    }
                                                }, onFocus: (e) => e.target.select(), min: "0" })] })] })] }), _jsxs("div", { className: "form-section summary", children: [_jsx("h3", { children: "Invoice Summary" }), withStay && (_jsxs("div", { className: "summary-row", children: [_jsx("span", { children: "Room Total:" }), _jsxs("span", { children: ["Rs. ", calculateRoomTotal()] })] })), _jsxs("div", { className: "summary-row", children: [_jsx("span", { children: "Food Total:" }), _jsxs("span", { children: ["Rs. ", calculateFoodTotal()] })] }), _jsxs("div", { className: "summary-row", children: [_jsx("span", { children: "Subtotal:" }), _jsxs("span", { children: ["Rs. ", calculateSubtotal()] })] }), _jsxs("div", { className: "summary-row", children: [_jsxs("span", { children: ["Tax (", taxRate, "%):"] }), _jsxs("span", { children: ["Rs. ", calculateTax()] })] }), _jsxs("div", { className: "summary-row", children: [_jsx("span", { children: "Discount:" }), _jsxs("span", { children: ["-Rs. ", discount] })] }), _jsxs("div", { className: "summary-row total", children: [_jsx("span", { children: "Total:" }), _jsxs("span", { children: ["Rs. ", calculateTotal()] })] })] }), _jsx("div", { className: "form-actions", children: _jsx("button", { type: "submit", className: "submit-btn", children: "Create Invoice" }) })] })] }));
};
export default InvoiceForm;
