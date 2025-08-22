import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DynamicTable from "./DynamicTable";
import { formatInvoiceIdForDisplay } from "../utils/invoiceUtils";
const InvoiceList = ({ invoices, onInvoiceClick, onPrintInvoice, loading = false, }) => {
    console.log("Invoices rendered", invoices);
    // Transform invoice data for the table
    const tableData = invoices.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: formatInvoiceIdForDisplay(invoice.invoiceId),
        guestName: invoice.guestInfo.name,
        checkIn: invoice.guestInfo.checkIn,
        checkOut: invoice.guestInfo.checkOut,
        roomType: invoice.roomInfo.roomType,
        totalAmount: invoice.total,
        phone: invoice.guestInfo.phone,
    }));
    const columns = [
        {
            key: "invoiceNumber",
            label: "Invoice #",
            type: "text",
            sortable: true,
        },
        {
            key: "guestName",
            label: "Guest Name",
            type: "text",
            sortable: true,
        },
        {
            key: "checkIn",
            label: "Check-in Date",
            type: "date",
            sortable: true,
        },
        {
            key: "checkOut",
            label: "Check-out Date",
            type: "date",
            sortable: true,
        },
        {
            key: "roomType",
            label: "Room Type",
            type: "text",
            sortable: true,
        },
        {
            key: "totalAmount",
            label: "Total Amount",
            type: "currency",
            sortable: true,
        },
        {
            key: "phone",
            label: "Phone",
            type: "text",
            sortable: true,
        },
        {
            key: "actions",
            label: "Actions",
            type: "action",
            sortable: false,
            width: "120px",
            render: (value, row) => {
                // Find the original invoice data to ensure we have the correct ID
                const originalInvoice = invoices.find((invoice) => invoice.id === row.id || invoice.guestInfo.name === row.guestName);
                console.log("Original invoice", originalInvoice);
                const invoiceId = originalInvoice?.invoiceId || row.id;
                console.log("Invoice ID", invoiceId);
                if (!invoiceId) {
                    console.error("Could not find invoice ID for row:", row);
                    return _jsx("div", { children: "Error: Invalid data" });
                }
                return (_jsx("div", { className: "action-buttons", children: _jsx("button", { onClick: (e) => {
                            e.stopPropagation();
                            onPrintInvoice?.(invoiceId);
                        }, className: "print-btn", title: "Create and Open Invoice PDF", disabled: loading, children: loading ? "⏳ Creating..." : "🖨️ Create & Open" }) }));
            },
        },
    ];
    const handleRowClick = (row) => {
        const selectedInvoice = invoices.find((invoice) => invoice.id === row.id);
        if (selectedInvoice && onInvoiceClick) {
            onInvoiceClick(selectedInvoice);
        }
    };
    return (_jsxs("div", { className: "invoice-list", children: [_jsxs("div", { className: "invoice-list-header", children: [_jsx("h2", { children: "Invoice List" }), _jsxs("p", { children: ["Total Invoices: ", invoices.length] })] }), _jsx(DynamicTable, { columns: columns, data: tableData, onRowClick: handleRowClick, sortable: true, searchable: true, pagination: true, itemsPerPage: 10, className: "invoice-table" })] }));
};
export default InvoiceList;
