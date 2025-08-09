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
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [customSettings, setCustomSettings] = useState({
    includeLogo: true,
    includeWatermark: false,
    paperSize: "A4",
    orientation: "portrait",
    colorScheme: "blue"
  });

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

  const getSelectedInvoiceDetails = () => {
    if (!selectedInvoiceId) return null;
    const invoice = invoices.find(inv => inv.id === selectedInvoiceId);
    if (!invoice) return null;

    const guestInfo = typeof invoice.guestInfo === "string" 
      ? JSON.parse(invoice.guestInfo) 
      : invoice.guestInfo;
    
    const roomInfo = typeof invoice.roomInfo === "string" 
      ? JSON.parse(invoice.roomInfo) 
      : invoice.roomInfo;

    return { guestInfo, roomInfo, invoice };
  };

  const selectedInvoice = getSelectedInvoiceDetails();

  return (
    <div className="pdf-creator-enhanced">
      {/* Header Section */}
      <div className="pdf-creator-header">
        <div className="header-content">
          <div className="header-left">
            <div className="hotel-logo">🏔️</div>
            <div className="header-text">
              <h2>Hotel Skardu PDF Generator</h2>
              <p>Create professional PDF documents with stunning design</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{invoices.length}</span>
              <span className="stat-label">Invoices</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{pdfTypes.length}</span>
              <span className="stat-label">PDF Types</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pdf-creator-content">
        {/* Main Form Section */}
        <div className="pdf-form-section">
          <div className="form-card">
            <div className="card-header">
              <h3>📄 PDF Configuration</h3>
              <p>Configure your PDF generation settings</p>
            </div>

            <div className="form-content">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pdfType">
                    <span className="label-icon">📋</span>
                    PDF Type
                  </label>
                  <select
                    id="pdfType"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    disabled={isLoading}
                    className="enhanced-select"
                  >
                    {pdfTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <span className="label-icon">⚙️</span>
                    Advanced Options
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="toggle-btn"
                  >
                    {showAdvancedOptions ? "Hide" : "Show"} Advanced Settings
                  </button>
                </div>
              </div>

              {selectedType && (
                <div className="pdf-description-card">
                  <div className="description-icon">ℹ️</div>
                  <div className="description-content">
                    <h4>Description</h4>
                    <p>{pdfTypes.find((t) => t.id === selectedType)?.description}</p>
                  </div>
                </div>
              )}

              {selectedType === "invoice" && invoices.length > 0 && (
                <div className="invoice-selection-section">
                  <div className="form-group">
                    <label htmlFor="invoiceSelect">
                      <span className="label-icon">🏷️</span>
                      Select Invoice
                    </label>
                    <select
                      id="invoiceSelect"
                      value={selectedInvoiceId}
                      onChange={(e) => setSelectedInvoiceId(e.target.value)}
                      disabled={isLoading}
                      className="enhanced-select"
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

                  {/* Invoice Preview */}
                  {selectedInvoice && (
                    <div className="invoice-preview-card">
                      <div className="preview-header">
                        <h4>📋 Invoice Preview</h4>
                        <span className="preview-badge">Live Preview</span>
                      </div>
                      <div className="preview-content">
                        <div className="preview-row">
                          <div className="preview-item">
                            <span className="preview-label">Guest Name:</span>
                            <span className="preview-value">{selectedInvoice.guestInfo.name}</span>
                          </div>
                          <div className="preview-item">
                            <span className="preview-label">Phone:</span>
                            <span className="preview-value">{selectedInvoice.guestInfo.phone}</span>
                          </div>
                        </div>
                        <div className="preview-row">
                          <div className="preview-item">
                            <span className="preview-label">Room:</span>
                            <span className="preview-value">{selectedInvoice.roomInfo.roomNumber} - {selectedInvoice.roomInfo.roomType}</span>
                          </div>
                          <div className="preview-item">
                            <span className="preview-label">Total Amount:</span>
                            <span className="preview-value amount">${selectedInvoice.invoice.total}</span>
                          </div>
                        </div>
                        <div className="preview-row">
                          <div className="preview-item">
                            <span className="preview-label">Check-in:</span>
                            <span className="preview-value">{new Date(selectedInvoice.guestInfo.checkIn).toLocaleDateString()}</span>
                          </div>
                          <div className="preview-item">
                            <span className="preview-label">Check-out:</span>
                            <span className="preview-value">{new Date(selectedInvoice.guestInfo.checkOut).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedType === "invoice" && invoices.length === 0 && (
                <div className="no-invoices-card">
                  <div className="no-invoices-icon">📭</div>
                  <div className="no-invoices-content">
                    <h4>No Invoices Found</h4>
                    <p>Please create some invoices first to generate PDFs.</p>
                    <button className="create-invoice-btn">Create New Invoice</button>
                  </div>
                </div>
              )}

              {/* Advanced Options */}
              {showAdvancedOptions && (
                <div className="advanced-options-card">
                  <div className="advanced-header">
                    <h4>⚙️ Advanced Settings</h4>
                    <p>Customize your PDF generation</p>
                  </div>
                  <div className="advanced-grid">
                    <div className="setting-group">
                      <label className="setting-label">
                        <input
                          type="checkbox"
                          checked={customSettings.includeLogo}
                          onChange={(e) => setCustomSettings({
                            ...customSettings,
                            includeLogo: e.target.checked
                          })}
                        />
                        Include Hotel Logo
                      </label>
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">
                        <input
                          type="checkbox"
                          checked={customSettings.includeWatermark}
                          onChange={(e) => setCustomSettings({
                            ...customSettings,
                            includeWatermark: e.target.checked
                          })}
                        />
                        Add Watermark
                      </label>
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">Paper Size:</label>
                      <select
                        value={customSettings.paperSize}
                        onChange={(e) => setCustomSettings({
                          ...customSettings,
                          paperSize: e.target.value
                        })}
                        className="setting-select"
                      >
                        <option value="A4">A4</option>
                        <option value="Letter">Letter</option>
                        <option value="Legal">Legal</option>
                      </select>
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">Orientation:</label>
                      <select
                        value={customSettings.orientation}
                        onChange={(e) => setCustomSettings({
                          ...customSettings,
                          orientation: e.target.value
                        })}
                        className="setting-select"
                      >
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button
                  onClick={handleCreatePDF}
                  disabled={
                    isLoading ||
                    !selectedType ||
                    (selectedType === "invoice" && !selectedInvoiceId)
                  }
                  className="generate-pdf-btn"
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">📄</span>
                      Generate Professional PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="info-section">
          <div className="info-card">
            <div className="info-header">
              <h3>📄 PDF Features</h3>
              <p>What makes our PDFs special</p>
            </div>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">🎨</div>
                <h4>Professional Design</h4>
                <p>Beautiful blue theme with Hotel Skardu branding</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <h4>Comprehensive Data</h4>
                <p>Complete guest, room, and financial information</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔢</div>
                <h4>Detailed Breakdown</h4>
                <p>Itemized charges, taxes, and discounts</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📱</div>
                <h4>Contact Details</h4>
                <p>Phone numbers, addresses, and contact information</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🏔️</div>
                <h4>Hotel Branding</h4>
                <p>Mountain theme with professional styling</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💾</div>
                <h4>Auto Save</h4>
                <p>Organized storage with descriptive filenames</p>
              </div>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-header">
              <h3>📞 Hotel Contact Information</h3>
            </div>
            <div className="contact-grid">
              <div className="contact-item">
                <span className="contact-icon">🏔️</span>
                <div className="contact-details">
                  <strong>Hotel Skardu</strong>
                  <p>Luxury & Comfort in the Heart of Paradise</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div className="contact-details">
                  <strong>Address</strong>
                  <p>Skardu Valley, Gilgit-Baltistan, Pakistan</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div className="contact-details">
                  <strong>Phone</strong>
                  <p>+92-581-123456</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <div className="contact-details">
                  <strong>Email</strong>
                  <p>info@hotelskardu.com</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🌐</span>
                <div className="contact-details">
                  <strong>Website</strong>
                  <p>www.hotelskardu.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`message-overlay ${message.type}`}>
          <div className="message-card">
            <div className="message-icon">
              {message.type === "success" ? "✅" : "❌"}
            </div>
            <div className="message-content">
              <h4>{message.type === "success" ? "Success!" : "Error"}</h4>
              <p>{message.text}</p>
            </div>
            <button onClick={clearMessage} className="message-close-btn">
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFCreator;
