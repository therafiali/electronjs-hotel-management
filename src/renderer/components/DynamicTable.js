import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
const DynamicTable = ({ columns, data, onRowClick, sortable = true, searchable = true, pagination = true, itemsPerPage = 10, className = "", }) => {
    const [sortConfig, setSortConfig] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    // Filter data based on search term
    const filteredData = data.filter((row) => columns.some((column) => {
        const value = row[column.key];
        if (value == null)
            return false;
        return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    }));
    // Sort data
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig)
            return 0;
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue)
            return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue)
            return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });
    // Paginate data
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);
    const handleSort = (key) => {
        if (!sortable)
            return;
        setSortConfig((current) => {
            if (current && current.key === key) {
                return {
                    key,
                    direction: current.direction === "asc" ? "desc" : "asc",
                };
            }
            return { key, direction: "asc" };
        });
    };
    const formatValue = (value, column, row) => {
        if (column.render) {
            return column.render(value, row);
        }
        if (value == null)
            return "-";
        switch (column.type) {
            case "currency":
                return `Rs. ${Number(value).toFixed(2)}`;
            case "number":
                return Number(value).toLocaleString();
            case "date":
                // Check if date value exists and is valid
                if (!value || value === '')
                    return "N/A";
                try {
                    const date = new Date(value);
                    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
                }
                catch {
                    return "N/A";
                }
            default:
                return value.toString();
        }
    };
    const getSortIcon = (key) => {
        if (!sortConfig || sortConfig.key !== key)
            return "↕️";
        return sortConfig.direction === "asc" ? "↑" : "↓";
    };
    return (_jsxs("div", { className: `dynamic-table ${className}`, children: [searchable && (_jsx("div", { className: "table-search", children: _jsx("input", { type: "text", placeholder: "Search...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "search-input" }) })), _jsx("div", { className: "table-container", children: _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsx("tr", { children: columns.map((column) => (_jsx("th", { onClick: () => handleSort(column.key), className: `table-header ${sortable && column.sortable !== false ? "sortable" : ""}`, style: { width: column.width }, children: _jsxs("div", { className: "header-content", children: [_jsx("span", { children: column.label }), sortable && column.sortable !== false && (_jsx("span", { className: "sort-icon", children: getSortIcon(column.key) }))] }) }, column.key))) }) }), _jsx("tbody", { children: paginatedData.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length, className: "no-data", children: "No data found" }) })) : (paginatedData.map((row, index) => (_jsx("tr", { onClick: () => onRowClick?.(row), className: onRowClick ? "clickable-row" : "", children: columns.map((column) => (_jsx("td", { className: `table-cell ${column.type || "text"}`, children: formatValue(row[column.key], column, row) }, column.key))) }, index)))) })] }) }), pagination && totalPages > 1 && (_jsxs("div", { className: "pagination", children: [_jsx("button", { onClick: () => setCurrentPage((prev) => Math.max(prev - 1, 1)), disabled: currentPage === 1, className: "pagination-btn", children: "Previous" }), _jsxs("span", { className: "page-info", children: ["Page ", currentPage, " of ", totalPages] }), _jsx("button", { onClick: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)), disabled: currentPage === totalPages, className: "pagination-btn", children: "Next" })] })), _jsxs("div", { className: "results-info", children: ["Showing ", startIndex + 1, " to", " ", Math.min(startIndex + itemsPerPage, sortedData.length), " of", " ", sortedData.length, " results"] })] }));
};
export default DynamicTable;
