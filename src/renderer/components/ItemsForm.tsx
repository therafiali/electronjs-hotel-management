import React, { useState } from 'react';

interface Item {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface ItemsFormProps {
  onSubmit: (itemData: Omit<Item, 'id'>) => Promise<any>;
  items: any[];
  onRefreshItems: () => void;
}

const ItemsForm: React.FC<ItemsFormProps> = ({ onSubmit, items, onRefreshItems }) => {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number | ''>('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName.trim() || !category || price === '' || price <= 0) {
      alert('Please fill all fields with valid data');
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
          const firstInput = document.getElementById('itemName') as HTMLInputElement;
          if (firstInput) {
            firstInput.focus();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div>
      {/* Form Card */}
      <div className="items-form" style={{ marginBottom: "30px" }}>
        <h2>Add New Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Item Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="itemName">Item Name *</label>
                <input
                  type="text"
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Add Item
            </button>
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className="items-form">
        <h2>🛍️ Current Items</h2>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#666", background: "#f8f9fa", borderRadius: "8px" }}>
            No items found. Create some items above!
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
              <thead>
                <tr style={{ background: "#3498db", color: "white" }}>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Item Name</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Category</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Price</th>
                  <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{item.name}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{item.category}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>${item.price}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{new Date(item.createdDate).toLocaleDateString()}</td>
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

export default ItemsForm;
