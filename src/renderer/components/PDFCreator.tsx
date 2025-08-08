import React, { useState, useEffect } from "react";

interface PDFType {
  id: string;
  name: string;
  description: string;
}

interface Invoice {
  id: string;
  guestInfo: any;
  roomInfo: any;
  total: number;
  date: string;
}

const PDFCreator: React.FC = () => {
  const [pdfTypes, setPdfTypes] = useState<PDFType[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    loadPDFTypes();
    loadInvoices();
  }, []);

  const loadPDFTypes = async () => {
    try {
      const types = await window.electronAPI.getPDFTypes();
      setPdfTypes(types);
      if (types.length > 0) {
        setSelectedType(types[0].id);
      }
    } catch (error) {
      console.error("Error loading PDF types:", error);
      setMessage({ text: "Failed to load PDF types", type: "error" });
    }
  };

  const loadInvoices = async () => {
    try {
      const allInvoices = await window.electronAPI.getAllInvoices();
      setInvoices(allInvoices);
      if (allInvoices.length > 0) {
        setSelectedInvoiceId(allInvoices[0].id);
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
      setMessage({ text: "Failed to load invoices", type: "error" });
    }
  };

  const handleCreatePDF = async () => {
    if (!selectedType) {
      setMessage({ text: "Please select a PDF type", type: "error" });
      return;
    }

    // For invoice PDFs, require an invoice to be selected
    if (selectedType === "invoice" && !selectedInvoiceId) {
      setMessage({
        text: "Please select an invoice to generate PDF",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const invoiceId =
        selectedType === "invoice" ? selectedInvoiceId : undefined;
      const result = await window.electronAPI.createPDF(
        selectedType,
        invoiceId
      );
      if (result.success) {
        setMessage({
          text: `PDF created successfully! Saved to: ${result.filepath}`,
          type: "success",
        });
      } else {
        setMessage({ text: "Failed to create PDF", type: "error" });
      }
    } catch (error) {
      console.error("Error creating PDF:", error);
      setMessage({ text: "Error creating PDF", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessage = () => {
    setMessage(null);
  };

  return (
    <div className="pdf-creator">
      <h2>PDF Creator</h2>
      <p>Generate various PDF documents for your hotel management system.</p>

      <div className="pdf-form">
        <div className="form-group">
          <label htmlFor="pdfType">Select PDF Type:</label>
          <select
            id="pdfType"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            disabled={isLoading}
          >
            {pdfTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {selectedType && (
          <div className="pdf-description">
            <p>
              <strong>Description:</strong>{" "}
              {pdfTypes.find((t) => t.id === selectedType)?.description}
            </p>
          </div>
        )}

        {selectedType === "invoice" && invoices.length > 0 && (
          <div className="form-group">
            <label htmlFor="invoiceSelect">Select Invoice:</label>
            <select
              id="invoiceSelect"
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              disabled={isLoading}
            >
              {invoices.map((invoice) => {
                const guestInfo =
                  typeof invoice.guestInfo === "string"
                    ? JSON.parse(invoice.guestInfo)
                    : invoice.guestInfo;
                const guestName = guestInfo?.name || "Unknown Guest";
                const date = new Date(invoice.date).toLocaleDateString();
                return (
                  <option key={invoice.id} value={invoice.id}>
                    {guestName} - ${invoice.total} - {date}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {selectedType === "invoice" && invoices.length === 0 && (
          <div className="pdf-description">
            <p style={{ color: "#e74c3c" }}>
              <strong>No invoices found.</strong> Please create some invoices
              first.
            </p>
          </div>
        )}

        <button
          onClick={handleCreatePDF}
          disabled={
            isLoading ||
            !selectedType ||
            (selectedType === "invoice" && !selectedInvoiceId)
          }
          className="create-pdf-btn"
        >
          {isLoading ? "Creating PDF..." : "Create PDF"}
        </button>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          <span>{message.text}</span>
          <button onClick={clearMessage} className="close-btn">
            ×
          </button>
        </div>
      )}

      <div className="pdf-info">
        <h3>Available PDF Types:</h3>
        <ul>
          <li>
            <strong>Invoice:</strong> Generate a detailed invoice PDF using real
            data from your database. Select an existing invoice to create a
            professional PDF with guest information, room charges, food items,
            taxes, and total amount.
          </li>
          <li>
            <strong>Hotel Report:</strong> Create a comprehensive hotel
            management report with occupancy statistics and revenue data.
          </li>
        </ul>
        <p>
          <em>
            Note: PDFs are saved to your Downloads folder in a
            "Hotel-Management-PDFs" subfolder.
          </em>
        </p>
      </div>
    </div>
  );
};

export default PDFCreator;
