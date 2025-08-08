import React, { useState } from 'react';

interface Item {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface ItemsFormProps {
  onSubmit: (itemData: Omit<Item, 'id'>) => Promise<any>;
}

const ItemsForm: React.FC<ItemsFormProps> = ({ onSubmit }) => {
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
    <div className="items-form">
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
  );
};

export default ItemsForm;
