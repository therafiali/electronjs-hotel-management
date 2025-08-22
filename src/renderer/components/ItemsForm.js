import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import EditButton from './EditButton';
const ItemsForm = ({ onSubmit, items, onRefreshItems, onUpdateItemPrice }) => {
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const categories = [
        'Food',
        'Beverage',
        'Service',
        'Amenity',
        'Room Service',
        'Laundry',
        'Transportation',
        'Recreation',
        'Other'
    ];
    const resetForm = () => {
        setItemName('');
        setCategory('');
        setPrice('');
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!itemName.trim() || !category || price === '' || price <= 0) {
            return;
        }
        const itemData = {
            name: itemName.trim(),
            category,
            price: Number(price)
        };
        try {
            const result = await onSubmit(itemData);
            // Only reset form if submission was successful
            if (result && result.success) {
                resetForm();
                // Refresh items list to show new item
                onRefreshItems();
                // Focus back to the first input field
                setTimeout(() => {
                    const firstInput = document.getElementById('itemName');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }, 100);
            }
        }
        catch (error) {
            console.error('Error submitting form:', error);
        }
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: "items-form", style: { marginBottom: "30px" }, children: [_jsx("h2", { children: "Add New Item" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-section", children: [_jsx("h3", { children: "Item Information" }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "itemName", children: "Item Name *" }), _jsx("input", { type: "text", id: "itemName", value: itemName, onChange: (e) => setItemName(e.target.value), placeholder: "Enter item name", required: true, onBlur: () => {
                                                            setItemName(itemName.trim());
                                                        } })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "category", children: "Category *" }), _jsxs("select", { id: "category", value: category, onChange: (e) => setCategory(e.target.value), required: true, children: [_jsx("option", { value: "", children: "Select a category" }), categories.map((cat) => (_jsx("option", { value: cat, children: cat }, cat)))] })] })] }), _jsx("div", { className: "form-row", children: _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "price", children: "Price *" }), _jsx("input", { type: "number", id: "price", value: price, onChange: (e) => setPrice(e.target.value === '' ? '' : Number(e.target.value)), placeholder: "0.00", min: "0", step: "0.01", required: true })] }) })] }), _jsx("div", { className: "form-actions", children: _jsx("button", { type: "submit", className: "submit-btn", children: "Add Item" }) })] })] }), _jsxs("div", { className: "items-form", children: [_jsx("h2", { children: "\uD83D\uDECD\uFE0F Current Items" }), items.length === 0 ? (_jsx("div", { style: { textAlign: "center", padding: "20px", color: "#666", background: "#f8f9fa", borderRadius: "8px" }, children: "No items found. Create some items above!" })) : (_jsx("div", { style: { overflowX: "auto" }, children: _jsxs("table", { style: { width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }, children: [_jsx("thead", { children: _jsxs("tr", { style: { background: "#3498db", color: "white" }, children: [_jsx("th", { style: { padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }, children: "Item Name" }), _jsx("th", { style: { padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }, children: "Category" }), _jsx("th", { style: { padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }, children: "Price" }), _jsx("th", { style: { padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }, children: "Created Date" }), _jsx("th", { style: { padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }, children: "Actions" })] }) }), _jsx("tbody", { children: items.map((item) => (_jsxs("tr", { style: { borderBottom: "1px solid #eee" }, children: [_jsx("td", { style: { padding: "12px", borderBottom: "1px solid #eee" }, children: item.name }), _jsx("td", { style: { padding: "12px", borderBottom: "1px solid #eee" }, children: item.category }), _jsxs("td", { style: { padding: "12px", borderBottom: "1px solid #eee" }, children: ["Rs. ", item.price] }), _jsx("td", { style: { padding: "12px", borderBottom: "1px solid #eee" }, children: new Date(item.createdDate).toLocaleDateString() }), _jsx("td", { style: { padding: "12px", borderBottom: "1px solid #eee" }, children: onUpdateItemPrice && (_jsx(EditButton, { value: item.price, onSave: async (newPrice) => {
                                                        await onUpdateItemPrice(item.id, newPrice);
                                                        onRefreshItems(); // Refresh to show updated price
                                                    }, fieldType: "number", placeholder: "New price" })) })] }, item.id))) })] }) }))] })] }));
};
export default ItemsForm;
