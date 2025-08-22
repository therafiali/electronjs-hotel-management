import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DynamicTable from './DynamicTable';
const ItemsList = ({ items, onItemClick }) => {
    // Transform item data for the table
    const tableData = items.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        formattedPrice: `Rs. ${item.price.toFixed(2)}`
    }));
    const columns = [
        {
            key: 'id',
            label: 'Item ID',
            type: 'text',
            sortable: true
        },
        {
            key: 'name',
            label: 'Item Name',
            type: 'text',
            sortable: true
        },
        {
            key: 'category',
            label: 'Category',
            type: 'text',
            sortable: true
        },
        {
            key: 'formattedPrice',
            label: 'Price',
            type: 'currency',
            sortable: true
        }
    ];
    const handleRowClick = (row) => {
        const selectedItem = items.find(item => item.id === row.id);
        if (selectedItem && onItemClick) {
            onItemClick(selectedItem);
        }
    };
    return (_jsxs("div", { className: "items-list", children: [_jsxs("div", { className: "items-list-header", children: [_jsx("h2", { children: "Items Management" }), _jsxs("p", { children: ["Total Items: ", items.length] })] }), _jsx(DynamicTable, { columns: columns, data: tableData, onRowClick: handleRowClick, sortable: true, searchable: true, pagination: true, itemsPerPage: 15, className: "items-table" })] }));
};
export default ItemsList;
