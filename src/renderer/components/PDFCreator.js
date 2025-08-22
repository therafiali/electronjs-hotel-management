import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
const PDFCreator = () => {
    const [pdfTypes, setPdfTypes] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [selectedType, setSelectedType] = useState("");
    const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [customSettings, setCustomSettings] = useState({
        includeLogo: true,
        includeWatermark: false,
        paperSize: "A4",
        orientation: "portrait",
        colorScheme: "blue",
    });
    const [databasePath, setDatabasePath] = useState("");
    const [dbMessage, setDbMessage] = useState("");
    const [dbLoading, setDbLoading] = useState(false);
    useEffect(() => {
        loadPDFTypes();
        loadInvoices();
        loadDatabasePath();
    }, []);
    const loadPDFTypes = async () => {
        try {
            const types = await window.electronAPI.getPDFTypes();
            setPdfTypes(types);
            if (types.length > 0) {
                setSelectedType(types[0].id);
            }
        }
        catch (error) {
            console.error("Error loading PDF types:", error);
            setMessage({ text: "Failed to load PDF types", type: "error" });
        }
    };
    const loadInvoices = async () => {
        try {
            const allInvoices = await window.electronAPI.getAllInvoices();
            setInvoices(allInvoices);
            if (allInvoices.length > 0) {
                setSelectedInvoiceId(allInvoices[0].invoiceId);
            }
        }
        catch (error) {
            console.error("Error loading invoices:", error);
            setMessage({ text: "Failed to load invoices", type: "error" });
        }
    };
    const loadDatabasePath = async () => {
        try {
            const result = await window.electronAPI.getDatabasePath();
            if (result.success) {
                setDatabasePath(result.path);
            }
            else {
                setDatabasePath("Error getting database path");
            }
        }
        catch (error) {
            console.error("Error getting database path:", error);
            setDatabasePath("Error: " + error.message);
        }
    };
    const handleUploadDatabase = async () => {
        try {
            setDbLoading(true);
            setDbMessage("");
            const result = await window.electronAPI.selectDatabaseFile();
            if (result.success && result.filePath) {
                try {
                    const uploadResult = await window.electronAPI.uploadDatabase(result.filePath);
                    if (uploadResult.success) {
                        setDbMessage(`✅ ${uploadResult.message} Backup created at: ${uploadResult.backupPath}`);
                        await loadInvoices();
                        await loadDatabasePath();
                    }
                    else {
                        setDbMessage(`❌ ${uploadResult.message}`);
                    }
                }
                catch (error) {
                    setDbMessage(`❌ Error: ${error.message}`);
                }
            }
            else {
                setDbMessage("ℹ️ No file selected");
            }
        }
        catch (error) {
            setDbMessage(`❌ Error: ${error.message}`);
        }
        finally {
            setDbLoading(false);
        }
    };
    const handleExportDatabase = async () => {
        try {
            setDbLoading(true);
            setDbMessage("");
            const result = await window.electronAPI.exportDatabase();
            if (result.success) {
                setDbMessage(`✅ ${result.message} Exported to: ${result.filePath}`);
            }
            else {
                setDbMessage(`ℹ️ ${result.message}`);
            }
        }
        catch (error) {
            setDbMessage(`❌ Error: ${error.message}`);
        }
        finally {
            setDbLoading(false);
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
            const invoiceId = selectedType === "invoice" ? selectedInvoiceId : undefined;
            console.log("🔍 PDF Creation Debug Info:");
            console.log("   Selected Type:", selectedType);
            console.log("   Selected Invoice ID:", selectedInvoiceId);
            console.log("   Sending Invoice ID:", invoiceId);
            console.log("   Available Invoices:", invoices.map(inv => ({
                invoiceId: inv.invoiceId,
                guestName: inv.guestInfo?.name,
                total: inv.total
            })));
            const result = await window.electronAPI.createPDF(selectedType, invoiceId);
            if (result.success) {
                setMessage({
                    text: `PDF created successfully! Saved to: ${result.filepath}`,
                    type: "success",
                });
            }
            else {
                setMessage({ text: "Failed to create PDF", type: "error" });
            }
        }
        catch (error) {
            console.error("Error creating PDF:", error);
            setMessage({ text: "Error creating PDF", type: "error" });
        }
        finally {
            setIsLoading(false);
        }
    };
    const clearMessage = () => {
        setMessage(null);
    };
    const getSelectedInvoiceDetails = () => {
        if (!selectedInvoiceId)
            return null;
        const invoice = invoices.find((inv) => inv.invoiceId === selectedInvoiceId);
        if (!invoice)
            return null;
        const guestInfo = typeof invoice.guestInfo === "string"
            ? JSON.parse(invoice.guestInfo)
            : invoice.guestInfo;
        const roomInfo = typeof invoice.roomInfo === "string"
            ? JSON.parse(invoice.roomInfo)
            : invoice.roomInfo;
        return { guestInfo, roomInfo, invoice };
    };
    const selectedInvoice = getSelectedInvoiceDetails();
    return (_jsxs("div", { className: "pdf-creator-enhanced", children: [_jsx("div", { className: "pdf-creator-header", children: _jsxs("div", { className: "header-content", children: [_jsxs("div", { className: "header-left", children: [_jsx("div", { className: "hotel-logo", children: "\uD83C\uDFD4\uFE0F" }), _jsxs("div", { className: "header-text", children: [_jsx("h2", { children: "Hotel Skardu PDF Generator" }), _jsx("p", { children: "Create professional PDF documents with stunning design" })] })] }), _jsxs("div", { className: "header-stats", children: [_jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-number", children: invoices.length }), _jsx("span", { className: "stat-label", children: "Invoices" })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-number", children: pdfTypes.length }), _jsx("span", { className: "stat-label", children: "PDF Types" })] })] })] }) }), _jsxs("div", { className: "database-management-section", style: {
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "25px",
                    margin: "20px 0",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                }, children: [_jsx("h3", { style: {
                            margin: "0 0 15px 0",
                            color: "#111827",
                            fontSize: "18px",
                            fontWeight: "600",
                            textAlign: "center"
                        }, children: "\uD83D\uDDC4\uFE0F Database Management" }), _jsx("p", { style: {
                            margin: "0 0 20px 0",
                            fontSize: "14px",
                            color: "#6b7280",
                            textAlign: "center"
                        }, children: "Upload updated database files or export current database for backup" }), _jsxs("div", { style: {
                            background: "#f8f9fa",
                            border: "1px solid #dee2e6",
                            borderRadius: "8px",
                            padding: "15px",
                            margin: "15px 0",
                            textAlign: "left"
                        }, children: [_jsx("h4", { style: { margin: "0 0 10px 0", color: "#0c5460" }, children: "\uD83D\uDCC1 Current Database Location:" }), _jsx("p", { style: {
                                    margin: "0",
                                    fontFamily: "monospace",
                                    fontSize: "12px",
                                    color: "#0c5460",
                                    wordBreak: "break-all",
                                    background: "#e9ecef",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #ced4da"
                                }, children: databasePath || "Loading database path..." }), _jsx("button", { onClick: loadDatabasePath, style: {
                                    background: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    padding: "5px 10px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    marginTop: "10px"
                                }, children: "Refresh Path" })] }), _jsxs("div", { style: {
                            display: "flex",
                            gap: "15px",
                            justifyContent: "center",
                            flexWrap: "wrap"
                        }, children: [_jsx("button", { onClick: handleUploadDatabase, disabled: dbLoading, style: {
                                    background: "#28a745",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 18px",
                                    borderRadius: "8px",
                                    cursor: dbLoading ? "not-allowed" : "pointer",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    opacity: dbLoading ? 0.6 : 1
                                }, children: "\uD83D\uDCC1 Upload Database" }), _jsx("button", { onClick: handleExportDatabase, disabled: dbLoading, style: {
                                    background: "#17a2b8",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 18px",
                                    borderRadius: "8px",
                                    cursor: dbLoading ? "not-allowed" : "pointer",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    opacity: dbLoading ? 0.6 : 1
                                }, children: "\uD83D\uDCE4 Export Database" })] }), dbMessage && (_jsx("div", { style: {
                            marginTop: "15px",
                            padding: "12px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            textAlign: "center",
                            background: dbMessage.includes('✅') ? "#d4edda" :
                                dbMessage.includes('❌') ? "#f8d7da" : "#d1ecf1",
                            color: dbMessage.includes('✅') ? "#155724" :
                                dbMessage.includes('❌') ? "#721c24" : "#0c5460",
                            border: `1px solid ${dbMessage.includes('✅') ? "#c3e6cb" :
                                dbMessage.includes('❌') ? "#f5c6cb" : "#bee5eb"}`
                        }, children: dbMessage }))] }), _jsxs("div", { className: "pdf-creator-content", children: [_jsx("div", { className: "pdf-form-section", children: _jsxs("div", { className: "form-card", children: [_jsxs("div", { className: "card-header", children: [_jsx("h3", { children: "\uD83D\uDCC4 PDF Configuration" }), _jsx("p", { children: "Configure your PDF generation settings" })] }), _jsxs("div", { className: "form-content", children: [_jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsxs("label", { htmlFor: "pdfType", children: [_jsx("span", { className: "label-icon", children: "\uD83D\uDCCB" }), "PDF Type"] }), _jsx("select", { id: "pdfType", value: selectedType, onChange: (e) => setSelectedType(e.target.value), disabled: isLoading, className: "enhanced-select", children: pdfTypes.map((type) => (_jsx("option", { value: type.id, children: type.name }, type.id))) })] }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { children: [_jsx("span", { className: "label-icon", children: "\u2699\uFE0F" }), "Advanced Options"] }), _jsxs("button", { type: "button", onClick: () => setShowAdvancedOptions(!showAdvancedOptions), className: "toggle-btn", children: [showAdvancedOptions ? "Hide" : "Show", " Advanced Settings"] })] })] }), selectedType && (_jsxs("div", { className: "pdf-description-card", children: [_jsx("div", { className: "description-icon", children: "\u2139\uFE0F" }), _jsxs("div", { className: "description-content", children: [_jsx("h4", { children: "Description" }), _jsx("p", { children: pdfTypes.find((t) => t.id === selectedType)?.description })] })] })), selectedType === "invoice" && invoices.length > 0 && (_jsxs("div", { className: "invoice-selection-section", children: [_jsxs("div", { className: "form-group", children: [_jsxs("label", { htmlFor: "invoiceSelect", children: [_jsx("span", { className: "label-icon", children: "\uD83C\uDFF7\uFE0F" }), "Select Invoice"] }), _jsx("select", { id: "invoiceSelect", value: selectedInvoiceId, onChange: (e) => {
                                                                console.log("🔄 Invoice Selection Changed:");
                                                                console.log("   Old Selection:", selectedInvoiceId);
                                                                console.log("   New Selection:", e.target.value);
                                                                console.log("   Selected Invoice Data:", invoices.find(inv => inv.invoiceId === e.target.value));
                                                                setSelectedInvoiceId(e.target.value);
                                                            }, disabled: isLoading, className: "enhanced-select", children: invoices.map((invoice) => {
                                                                const guestInfo = typeof invoice.guestInfo === "string"
                                                                    ? JSON.parse(invoice.guestInfo)
                                                                    : invoice.guestInfo;
                                                                const guestName = guestInfo?.name || "Unknown Guest";
                                                                const date = new Date(invoice.date).toLocaleDateString();
                                                                return (_jsxs("option", { value: invoice.invoiceId, children: [guestName, " - Rs. ", invoice.total, " - ", date] }, invoice.invoiceId));
                                                            }) })] }), selectedInvoice && (_jsxs("div", { className: "invoice-preview-card", children: [_jsxs("div", { className: "preview-header", children: [_jsx("h4", { children: "\uD83D\uDCCB Invoice Preview" }), _jsx("span", { className: "preview-badge", children: "Live Preview" })] }), _jsxs("div", { className: "preview-content", children: [_jsxs("div", { className: "preview-row", children: [_jsxs("div", { className: "preview-item", children: [_jsx("span", { className: "preview-label", children: "Guest Name:" }), _jsx("span", { className: "preview-value", children: selectedInvoice.guestInfo.name })] }), _jsxs("div", { className: "preview-item", children: [_jsx("span", { className: "preview-label", children: "Phone:" }), _jsx("span", { className: "preview-value", children: selectedInvoice.guestInfo.phone })] })] }), _jsxs("div", { className: "preview-row", children: [_jsxs("div", { className: "preview-item", children: [_jsx("span", { className: "preview-label", children: "Room:" }), _jsxs("span", { className: "preview-value", children: [selectedInvoice.roomInfo.roomNumber, " -", " ", selectedInvoice.roomInfo.roomType] })] }), _jsxs("div", { className: "preview-item", children: [_jsx("span", { className: "preview-label", children: "Total Amount:" }), _jsxs("span", { className: "preview-value amount", children: ["Rs. ", selectedInvoice.invoice.total] })] })] }), _jsxs("div", { className: "preview-row", children: [_jsxs("div", { className: "preview-item", children: [_jsx("span", { className: "preview-label", children: "Check-in:" }), _jsx("span", { className: "preview-value", children: new Date(selectedInvoice.guestInfo.checkIn).toLocaleDateString() })] }), _jsxs("div", { className: "preview-item", children: [_jsx("span", { className: "preview-label", children: "Check-out:" }), _jsx("span", { className: "preview-value", children: new Date(selectedInvoice.guestInfo.checkOut).toLocaleDateString() })] })] })] })] }))] })), selectedType === "invoice" && invoices.length === 0 && (_jsxs("div", { className: "no-invoices-card", children: [_jsx("div", { className: "no-invoices-icon", children: "\uD83D\uDCED" }), _jsxs("div", { className: "no-invoices-content", children: [_jsx("h4", { children: "No Invoices Found" }), _jsx("p", { children: "Please create some invoices first to generate PDFs." }), _jsx("button", { className: "create-invoice-btn", children: "Create New Invoice" })] })] })), showAdvancedOptions && (_jsxs("div", { className: "advanced-options-card", children: [_jsxs("div", { className: "advanced-header", children: [_jsx("h4", { children: "\u2699\uFE0F Advanced Settings" }), _jsx("p", { children: "Customize your PDF generation" })] }), _jsxs("div", { className: "advanced-grid", children: [_jsx("div", { className: "setting-group", children: _jsxs("label", { className: "setting-label", children: [_jsx("input", { type: "checkbox", checked: customSettings.includeLogo, onChange: (e) => setCustomSettings({
                                                                            ...customSettings,
                                                                            includeLogo: e.target.checked,
                                                                        }) }), "Include Hotel Logo"] }) }), _jsx("div", { className: "setting-group", children: _jsxs("label", { className: "setting-label", children: [_jsx("input", { type: "checkbox", checked: customSettings.includeWatermark, onChange: (e) => setCustomSettings({
                                                                            ...customSettings,
                                                                            includeWatermark: e.target.checked,
                                                                        }) }), "Add Watermark"] }) }), _jsxs("div", { className: "setting-group", children: [_jsx("label", { className: "setting-label", children: "Paper Size:" }), _jsxs("select", { value: customSettings.paperSize, onChange: (e) => setCustomSettings({
                                                                        ...customSettings,
                                                                        paperSize: e.target.value,
                                                                    }), className: "setting-select", children: [_jsx("option", { value: "A4", children: "A4" }), _jsx("option", { value: "Letter", children: "Letter" }), _jsx("option", { value: "Legal", children: "Legal" })] })] }), _jsxs("div", { className: "setting-group", children: [_jsx("label", { className: "setting-label", children: "Orientation:" }), _jsxs("select", { value: customSettings.orientation, onChange: (e) => setCustomSettings({
                                                                        ...customSettings,
                                                                        orientation: e.target.value,
                                                                    }), className: "setting-select", children: [_jsx("option", { value: "portrait", children: "Portrait" }), _jsx("option", { value: "landscape", children: "Landscape" })] })] })] })] })), _jsx("div", { className: "form-actions", children: _jsx("button", { onClick: handleCreatePDF, disabled: isLoading ||
                                                    !selectedType ||
                                                    (selectedType === "invoice" && !selectedInvoiceId), className: "generate-pdf-btn", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "loading-spinner" }), "Generating PDF..."] })) : (_jsxs(_Fragment, { children: [_jsx("span", { className: "btn-icon", children: "\uD83D\uDCC4" }), "Generate Professional PDF"] })) }) })] })] }) }), _jsxs("div", { className: "info-section", children: [_jsxs("div", { className: "info-card", children: [_jsxs("div", { className: "info-header", children: [_jsx("h3", { children: "\uD83D\uDCC4 PDF Features" }), _jsx("p", { children: "What makes our PDFs special" })] }), _jsxs("div", { className: "features-grid", children: [_jsxs("div", { className: "feature-item", children: [_jsx("div", { className: "feature-icon", children: "\uD83C\uDFA8" }), _jsx("h4", { children: "Professional Design" }), _jsx("p", { children: "Beautiful blue theme with Hotel Skardu branding" })] }), _jsxs("div", { className: "feature-item", children: [_jsx("div", { className: "feature-icon", children: "\uD83D\uDCCA" }), _jsx("h4", { children: "Comprehensive Data" }), _jsx("p", { children: "Complete guest, room, and financial information" })] }), _jsxs("div", { className: "feature-item", children: [_jsx("div", { className: "feature-icon", children: "\uD83D\uDD22" }), _jsx("h4", { children: "Detailed Breakdown" }), _jsx("p", { children: "Itemized charges, taxes, and discounts" })] }), _jsxs("div", { className: "feature-item", children: [_jsx("div", { className: "feature-icon", children: "\uD83D\uDCF1" }), _jsx("h4", { children: "Contact Details" }), _jsx("p", { children: "Phone numbers, addresses, and contact information" })] }), _jsxs("div", { className: "feature-item", children: [_jsx("div", { className: "feature-icon", children: "\uD83C\uDFD4\uFE0F" }), _jsx("h4", { children: "Hotel Branding" }), _jsx("p", { children: "Mountain theme with professional styling" })] }), _jsxs("div", { className: "feature-item", children: [_jsx("div", { className: "feature-icon", children: "\uD83D\uDCBE" }), _jsx("h4", { children: "Auto Save" }), _jsx("p", { children: "Organized storage with descriptive filenames" })] })] })] }), _jsxs("div", { className: "contact-info-card", children: [_jsx("div", { className: "contact-header", children: _jsx("h3", { children: "\uD83D\uDCDE Hotel Contact Information" }) }), _jsxs("div", { className: "contact-grid", children: [_jsxs("div", { className: "contact-item", children: [_jsx("span", { className: "contact-icon", children: "\uD83C\uDFD4\uFE0F" }), _jsxs("div", { className: "contact-details", children: [_jsx("strong", { children: "Hotel Skardu" }), _jsx("p", { children: "Luxury & Comfort in the Heart of Paradise" })] })] }), _jsxs("div", { className: "contact-item", children: [_jsx("span", { className: "contact-icon", children: "\uD83D\uDCCD" }), _jsxs("div", { className: "contact-details", children: [_jsx("strong", { children: "Address" }), _jsx("p", { children: "Skardu Valley, Gilgit-Baltistan, Pakistan" })] })] }), _jsxs("div", { className: "contact-item", children: [_jsx("span", { className: "contact-icon", children: "\uD83D\uDCDE" }), _jsxs("div", { className: "contact-details", children: [_jsx("strong", { children: "Phone" }), _jsx("p", { children: "+92-581-123456" })] })] }), _jsxs("div", { className: "contact-item", children: [_jsx("span", { className: "contact-icon", children: "\u2709\uFE0F" }), _jsxs("div", { className: "contact-details", children: [_jsx("strong", { children: "Email" }), _jsx("p", { children: "info@hotelskardu.com" })] })] }), _jsxs("div", { className: "contact-item", children: [_jsx("span", { className: "contact-icon", children: "\uD83C\uDF10" }), _jsxs("div", { className: "contact-details", children: [_jsx("strong", { children: "Website" }), _jsx("p", { children: "www.hotelskardu.com" })] })] })] })] })] })] }), message && (_jsx("div", { className: `message-overlay ${message.type}`, children: _jsxs("div", { className: "message-card", children: [_jsx("div", { className: "message-icon", children: message.type === "success" ? "✅" : "❌" }), _jsxs("div", { className: "message-content", children: [_jsx("h4", { children: message.type === "success" ? "Success!" : "Error" }), _jsx("p", { children: message.text })] }), _jsx("button", { onClick: clearMessage, className: "message-close-btn", children: "\u00D7" })] }) }))] }));
};
export default PDFCreator;
