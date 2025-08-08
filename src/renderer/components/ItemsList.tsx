import React from 'react';
import DynamicTable from './DynamicTable';

interface Item {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface ItemsListProps {
  items: Item[];
  onItemClick?: (item: Item) => void;
}

const ItemsList: React.FC<ItemsListProps> = ({ items, onItemClick }) => {
  // Transform item data for the table
  const tableData = items.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    formattedPrice: `$${item.price.toFixed(2)}`
  }));

  const columns = [
    {
      key: 'id',
      label: 'Item ID',
      type: 'text' as const,
      sortable: true
    },
    {
      key: 'name',
      label: 'Item Name',
      type: 'text' as const,
      sortable: true
    },
    {
      key: 'category',
      label: 'Category',
      type: 'text' as const,
      sortable: true
    },
    {
      key: 'formattedPrice',
      label: 'Price',
      type: 'currency' as const,
      sortable: true
    }
  ];

  const handleRowClick = (row: any) => {
    const selectedItem = items.find(item => item.id === row.id);
    if (selectedItem && onItemClick) {
      onItemClick(selectedItem);
    }
  };

  return (
    <div className="items-list">
      <div className="items-list-header">
        <h2>Items Management</h2>
        <p>Total Items: {items.length}</p>
      </div>
      
      <DynamicTable
        columns={columns}
        data={tableData}
        onRowClick={handleRowClick}
        sortable={true}
        searchable={true}
        pagination={true}
        itemsPerPage={15}
        className="items-table"
      />
    </div>
  );
};

export default ItemsList;
