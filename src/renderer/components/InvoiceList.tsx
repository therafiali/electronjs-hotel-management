import React from "react";
import DynamicTable from "./DynamicTable";

interface Invoice {
  id: string;
  guestInfo: {
    name: string;
    phone: string;
    address: string;
    checkIn: string;
    checkOut: string;
  };
  roomInfo: {
    roomNumber: string;
    roomType: string;
    pricePerNight: number;
    nights: number;
  };
  foodItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  taxRate: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  date: string;
}

interface InvoiceListProps {
  invoices: Invoice[];
  onInvoiceClick?: (invoice: Invoice) => void;
  onPrintInvoice?: (invoiceId: string) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  onInvoiceClick,
  onPrintInvoice,
}) => {
  // Transform invoice data for the table
  const tableData = invoices.map((invoice) => ({
    id: invoice.id,
    guestName: invoice.guestInfo.name,
    checkIn: invoice.guestInfo.checkIn,
    checkOut: invoice.guestInfo.checkOut,
    roomType: invoice.roomInfo.roomType,
    totalAmount: invoice.total,
    phone: invoice.guestInfo.phone,
  }));

  const columns = [
    {
      key: "guestName",
      label: "Guest Name",
      type: "text" as const,
      sortable: true,
    },
    {
      key: "checkIn",
      label: "Check-in Date",
      type: "date" as const,
      sortable: true,
    },
    {
      key: "checkOut",
      label: "Check-out Date",
      type: "date" as const,
      sortable: true,
    },
    {
      key: "roomType",
      label: "Room Type",
      type: "text" as const,
      sortable: true,
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      type: "currency" as const,
      sortable: true,
    },
    {
      key: "phone",
      label: "Phone",
      type: "text" as const,
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      type: "action" as const,
      sortable: false,
      width: "120px",
      render: (value: any, row: any) => {
        // Find the original invoice data to ensure we have the correct ID
        const originalInvoice = invoices.find(
          (invoice) =>
            invoice.id === row.id || invoice.guestInfo.name === row.guestName
        );

        const invoiceId = originalInvoice?.id || row.id;

        if (!invoiceId) {
          console.error("Could not find invoice ID for row:", row);
          return <div>Error: Invalid data</div>;
        }

        return (
          <div className="action-buttons">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrintInvoice?.(invoiceId);
              }}
              className="print-btn"
              title="Print Invoice PDF"
            >
              🖨️ Create Invoice
            </button>
          </div>
        );
      },
    },
  ];

  const handleRowClick = (row: any) => {
    const selectedInvoice = invoices.find((invoice) => invoice.id === row.id);
    if (selectedInvoice && onInvoiceClick) {
      onInvoiceClick(selectedInvoice);
    }
  };

  return (
    <div className="invoice-list">
      <div className="invoice-list-header">
        <h2>Invoice List</h2>
        <p>Total Invoices: {invoices.length}</p>
      </div>

      <DynamicTable
        columns={columns}
        data={tableData}
        onRowClick={handleRowClick}
        sortable={true}
        searchable={true}
        pagination={true}
        itemsPerPage={10}
        className="invoice-table"
      />
    </div>
  );
};

export default InvoiceList;
