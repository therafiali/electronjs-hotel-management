import React, { useState } from "react";

interface Column {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "currency" | "action";
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DynamicTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  sortable?: boolean;
  searchable?: boolean;
  pagination?: boolean;
  itemsPerPage?: number;
  className?: string;
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  columns,
  data,
  onRowClick,
  sortable = true,
  searchable = true,
  pagination = true,
  itemsPerPage = 10,
  className = "",
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search term
  const filteredData = data.filter((row) =>
    columns.some((column) => {
      const value = row[column.key];
      if (value == null) return false;
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key: string) => {
    if (!sortable) return;

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

  const formatValue = (value: any, column: Column, row: any) => {
    if (column.render) {
      return column.render(value, row);
    }

    if (value == null) return "-";

    switch (column.type) {
      case "currency":
        return `Rs. ${Number(value).toFixed(2)}`;
      case "number":
        return Number(value).toLocaleString();
      case "date":
        // Check if date value exists and is valid
        if (!value || value === '') return "N/A";
        try {
          const date = new Date(value);
          return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
        } catch {
          return "N/A";
        }
      default:
        return value.toString();
    }
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return "↕️";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className={`dynamic-table ${className}`}>
      {/* Search Bar */}
      {searchable && (
        <div className="table-search">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  className={`table-header ${
                    sortable && column.sortable !== false ? "sortable" : ""
                  }`}
                  style={{ width: column.width }}
                >
                  <div className="header-content">
                    <span>{column.label}</span>
                    {sortable && column.sortable !== false && (
                      <span className="sort-icon">
                        {getSortIcon(column.key)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="no-data">
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? "clickable-row" : ""}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`table-cell ${column.type || "text"}`}
                    >
                      {formatValue(row[column.key], column, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>

          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Results Info */}
      <div className="results-info">
        Showing {startIndex + 1} to{" "}
        {Math.min(startIndex + itemsPerPage, sortedData.length)} of{" "}
        {sortedData.length} results
      </div>
    </div>
  );
};

export default DynamicTable;
