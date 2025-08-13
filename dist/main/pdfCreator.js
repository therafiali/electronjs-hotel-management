"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const electron_1 = require("electron");
const database_1 = __importDefault(require("./database"));
class PDFCreator {
    constructor() {
        this.hotelInfo = {
            name: "HOTEL SKARDU",
            tagline: "Luxury & Comfort in the Heart of Paradise",
            address: "Skardu Valley, Gilgit-Baltistan, Pakistan",
            phone: "+92-581-123456",
            email: "info@hotelskardu.com",
            website: "www.hotelskardu.com",
        };
        this.ensureDownloadsDirectory();
    }
    ensureDownloadsDirectory() {
        const downloadsPath = path.join(electron_1.app.getPath("downloads"), "Hotel-Management-PDFs");
        if (!fs.existsSync(downloadsPath)) {
            fs.mkdirSync(downloadsPath, { recursive: true });
        }
    }
    getDownloadsPath() {
        return path.join(electron_1.app.getPath("downloads"), "Hotel-Management-PDFs");
    }
    async getInvoiceFromDatabase(invoiceId) {
        const db = new database_1.default();
        const invoices = db.getAllInvoices();
        const invoice = invoices.find((invoice) => invoice.invoiceId === invoiceId);
        if (!invoice) {
            throw new Error(`Invoice with ID ${invoiceId} not found`);
        }
        // Transform the data to match the expected interface
        return {
            id: invoice.invoiceId,
            guestInfo: invoice.guestInfo,
            roomInfo: {
                roomNumber: invoice.roomInfo.roomNumber,
                roomType: invoice.roomInfo.roomType,
                pricePerNight: invoice.roomInfo.pricePerNight,
                nights: this.calculateNights(invoice.guestInfo.checkIn, invoice.guestInfo.checkOut),
            },
            foodItems: invoice.foodItems || [],
            taxRate: invoice.taxRate,
            discount: invoice.discount,
            subtotal: invoice.subtotal,
            tax: invoice.tax,
            total: invoice.total,
            date: invoice.date,
        };
    }
    calculateNights(checkIn, checkOut) {
        try {
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays || 1; // Return at least 1 night
        }
        catch (error) {
            console.warn("Error calculating nights, defaulting to 1:", error);
            return 1;
        }
    }
    drawHeader(doc) {
        // Hotel name and tagline
        doc
            .fontSize(28)
            .fillColor("#1e3a8a")
            .font("Helvetica-Bold")
            .text(this.hotelInfo.name, 50, 60, { align: "center" });
        doc
            .fontSize(14)
            .fillColor("#64748b")
            .font("Helvetica")
            .text(this.hotelInfo.tagline, 50, 90, { align: "center" });
        // Hotel contact information
        doc
            .fontSize(11)
            .fillColor("#374151")
            .font("Helvetica")
            .text(this.hotelInfo.address, 50, 115, { align: "center" })
            .text(`Phone: ${this.hotelInfo.phone} | Email: ${this.hotelInfo.email}`, 50, 135, { align: "center" })
            .text(`Website: ${this.hotelInfo.website}`, 50, 155, { align: "center" });
        // Separator line
        doc
            .moveTo(50, 180)
            .lineTo(545, 180)
            .strokeColor("#e5e7eb")
            .lineWidth(1)
            .stroke();
    }
    drawInvoiceTitle(doc, invoiceData) {
        // Invoice title
        doc
            .fontSize(24)
            .fillColor("#1e3a8a")
            .font("Helvetica-Bold")
            .text("INVOICE", 50, 200, { align: "center" });
        // Invoice details in two columns
        const leftCol = 50;
        const rightCol = 320;
        let currentY = 240;
        // Left column - Invoice details
        doc
            .fontSize(12)
            .fillColor("#374151")
            .font("Helvetica-Bold")
            .text("Invoice Details:", leftCol, currentY);
        currentY += 20;
        doc
            .fontSize(11)
            .fillColor("#6b7280")
            .font("Helvetica")
            .text("Invoice Number:", leftCol, currentY)
            .text("Issue Date:", leftCol, currentY + 18)
            .text("Due Date:", leftCol, currentY + 36)
            .text("Payment Status:", leftCol, currentY + 54);
        doc
            .fontSize(11)
            .fillColor("#111827")
            .font("Helvetica-Bold")
            .text(invoiceData.id || "N/A", leftCol + 100, currentY)
            .text(invoiceData.date
            ? new Date(invoiceData.date).toLocaleDateString()
            : "N/A", leftCol + 100, currentY + 18)
            .text(invoiceData.date
            ? new Date(invoiceData.date).toLocaleDateString()
            : "N/A", leftCol + 100, currentY + 36)
            .text("PAID", leftCol + 100, currentY + 54);
        // Right column - System details
        doc
            .fontSize(12)
            .fillColor("#374151")
            .font("Helvetica-Bold")
            .text("System Information:", rightCol, 240);
        doc
            .fontSize(11)
            .fillColor("#6b7280")
            .font("Helvetica")
            .text("Generated By:", rightCol, currentY)
            .text("Generated On:", rightCol, currentY + 18)
            .text("System Version:", rightCol, currentY + 36);
        doc
            .fontSize(11)
            .fillColor("#111827")
            .font("Helvetica-Bold")
            .text("Hotel Management System", rightCol + 100, currentY)
            .text(new Date().toLocaleString(), rightCol + 100, currentY + 18)
            .text("v2.0", rightCol + 100, currentY + 36);
    }
    drawGuestInformation(doc, invoiceData) {
        // Guest Information Section
        doc
            .fontSize(16)
            .fillColor("#1e3a8a")
            .font("Helvetica-Bold")
            .text("Guest Information", 50, 340);
        // Guest details box
        doc
            .rect(50, 360, 250, 90)
            .fill("#f8fafc")
            .strokeColor("#e5e7eb")
            .lineWidth(1)
            .stroke();
        let guestY = 370;
        const guestLabelX = 60;
        const guestValueX = 160;
        doc
            .fontSize(11)
            .fillColor("#374151")
            .font("Helvetica-Bold")
            .text("Guest Name:", guestLabelX, guestY)
            .text("Phone Number:", guestLabelX, guestY + 18)
            .text("Address:", guestLabelX, guestY + 36)
            .text("Check-in Date:", guestLabelX, guestY + 54)
            .text("Check-out Date:", guestLabelX, guestY + 72);
        doc
            .fontSize(11)
            .fillColor("#111827")
            .font("Helvetica")
            .text(invoiceData.guestInfo.name || "N/A", guestValueX, guestY)
            .text(invoiceData.guestInfo.phone || "N/A", guestValueX, guestY + 18)
            .text(invoiceData.guestInfo.address || "N/A", guestValueX, guestY + 36)
            .text(invoiceData.guestInfo.checkIn
            ? new Date(invoiceData.guestInfo.checkIn).toLocaleDateString()
            : "N/A", guestValueX, guestY + 54)
            .text(invoiceData.guestInfo.checkOut
            ? new Date(invoiceData.guestInfo.checkOut).toLocaleDateString()
            : "N/A", guestValueX, guestY + 72);
        // Room Information Section
        doc
            .fontSize(16)
            .fillColor("#1e3a8a")
            .font("Helvetica-Bold")
            .text("Room Information", 330, 340);
        // Room details box
        doc
            .rect(330, 360, 215, 90)
            .fill("#f8fafc")
            .strokeColor("#e5e7eb")
            .lineWidth(1)
            .stroke();
        let roomY = 370;
        const roomLabelX = 340;
        const roomValueX = 440;
        doc
            .fontSize(11)
            .fillColor("#374151")
            .font("Helvetica-Bold")
            .text("Room Number:", roomLabelX, roomY)
            .text("Room Type:", roomLabelX, roomY + 18)
            .text("Price per Night:", roomLabelX, roomY + 36)
            .text("Number of Nights:", roomLabelX, roomY + 54)
            .text("Total Room Cost:", roomLabelX, roomY + 72);
        doc
            .fontSize(11)
            .fillColor("#111827")
            .font("Helvetica")
            .text(invoiceData.roomInfo.roomNumber || "N/A", roomValueX, roomY)
            .text(invoiceData.roomInfo.roomType || "N/A", roomValueX, roomY + 18)
            .text(`Rs. ${(invoiceData.roomInfo.pricePerNight || 0).toFixed(2)}`, roomValueX, roomY + 36)
            .text((invoiceData.roomInfo.nights || 1).toString(), roomValueX, roomY + 54)
            .text(`Rs. ${(invoiceData.roomInfo.pricePerNight *
            (invoiceData.roomInfo.nights || 1)).toFixed(2)}`, roomValueX, roomY + 72);
    }
    drawChargesTable(doc, invoiceData) {
        // Charges Section Title
        doc
            .fontSize(16)
            .fillColor("#1e3a8a")
            .font("Helvetica-Bold")
            .text("Detailed Charges", 50, 480);
        // Table header
        const tableStartY = 500;
        const col1 = 50; // Description
        const col2 = 320; // Quantity
        const col3 = 380; // Unit Price
        const col4 = 460; // Total
        // Header background
        doc.rect(col1, tableStartY, 495, 25).fill("#1e3a8a");
        // Header text
        doc
            .fontSize(12)
            .fillColor("#ffffff")
            .font("Helvetica-Bold")
            .text("Description", col1 + 10, tableStartY + 8)
            .text("Qty", col2 + 10, tableStartY + 8)
            .text("Unit Price", col3 + 10, tableStartY + 8)
            .text("Total", col4 + 10, tableStartY + 8);
        let currentY = tableStartY + 25;
        // Room charges
        doc
            .rect(col1, currentY, 495, 25)
            .fill("#ffffff")
            .strokeColor("#e5e7eb")
            .lineWidth(0.5)
            .stroke();
        doc
            .fontSize(11)
            .fillColor("#111827")
            .font("Helvetica-Bold")
            .text(`${invoiceData.roomInfo.roomType || "N/A"} - Room ${invoiceData.roomInfo.roomNumber || "N/A"}`, col1 + 10, currentY + 8)
            .font("Helvetica")
            .text((invoiceData.roomInfo.nights || 1).toString(), col2 + 10, currentY + 8)
            .text(`Rs. ${(invoiceData.roomInfo.pricePerNight || 0).toFixed(2)}`, col3 + 10, currentY + 8)
            .text(`Rs. ${(invoiceData.roomInfo.pricePerNight *
            (invoiceData.roomInfo.nights || 1)).toFixed(2)}`, col4 + 10, currentY + 8);
        currentY += 25;
        // Food items section
        if (invoiceData.foodItems && invoiceData.foodItems.length > 0) {
            // Food section header
            doc
                .rect(col1, currentY, 495, 25)
                .fill("#f1f5f9")
                .strokeColor("#e5e7eb")
                .lineWidth(0.5)
                .stroke();
            doc
                .fontSize(12)
                .fillColor("#374151")
                .font("Helvetica-Bold")
                .text("Food & Beverages", col1 + 10, currentY + 8);
            currentY += 25;
            // Individual food items
            invoiceData.foodItems.forEach((item) => {
                doc
                    .rect(col1, currentY, 495, 25)
                    .fill("#ffffff")
                    .strokeColor("#e5e7eb")
                    .lineWidth(0.5)
                    .stroke();
                doc
                    .fontSize(11)
                    .fillColor("#111827")
                    .font("Helvetica")
                    .text(item.name || "N/A", col1 + 10, currentY + 8)
                    .text((item.quantity || 0).toString(), col2 + 10, currentY + 8)
                    .text(`Rs. ${(item.price || 0).toFixed(2)}`, col3 + 10, currentY + 8)
                    .text(`Rs. ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}`, col4 + 10, currentY + 8);
                currentY += 25;
            });
        }
        // Subtotal row
        doc
            .rect(col1, currentY, 495, 25)
            .fill("#f8fafc")
            .strokeColor("#e5e7eb")
            .lineWidth(0.5)
            .stroke();
        doc
            .fontSize(11)
            .fillColor("#374151")
            .font("Helvetica-Bold")
            .text("Subtotal", col3 + 10, currentY + 8)
            .text(`Rs. ${(invoiceData.subtotal || 0).toFixed(2)}`, col4 + 10, currentY + 8);
        currentY += 25;
        // Tax row
        doc
            .rect(col1, currentY, 495, 25)
            .fill("#f8fafc")
            .strokeColor("#e5e7eb")
            .lineWidth(0.5)
            .stroke();
        doc
            .fontSize(11)
            .fillColor("#374151")
            .font("Helvetica-Bold")
            .text(`Tax (${invoiceData.taxRate || 0}%)`, col3 + 10, currentY + 8)
            .text(`Rs. ${(invoiceData.tax || 0).toFixed(2)}`, col4 + 10, currentY + 8);
        currentY += 25;
        // Discount row (if applicable)
        if ((invoiceData.discount || 0) > 0) {
            doc
                .rect(col1, currentY, 495, 25)
                .fill("#fef2f2")
                .strokeColor("#e5e7eb")
                .lineWidth(0.5)
                .stroke();
            doc
                .fontSize(11)
                .fillColor("#dc2626")
                .font("Helvetica-Bold")
                .text("Discount", col3 + 10, currentY + 8)
                .text(`-Rs. ${(invoiceData.discount || 0).toFixed(2)}`, col4 + 10, currentY + 8);
            currentY += 25;
        }
        // Total row
        doc
            .rect(col1, currentY, 495, 30)
            .fill("#1e3a8a")
            .strokeColor("#1e3a8a")
            .lineWidth(1)
            .stroke();
        doc
            .fontSize(13)
            .fillColor("#ffffff")
            .font("Helvetica-Bold")
            .text("TOTAL AMOUNT", col3 + 10, currentY + 10)
            .text(`Rs. ${(invoiceData.total || 0).toFixed(2)}`, col4 + 10, currentY + 10);
    }
    drawFooter(doc) {
        const pageHeight = 842;
        const footerY = pageHeight - 120;
        // Separator line
        doc
            .moveTo(50, footerY)
            .lineTo(545, footerY)
            .strokeColor("#e5e7eb")
            .lineWidth(1)
            .stroke();
        // Thank you message
        doc
            .fontSize(14)
            .fillColor("#1e3a8a")
            .font("Helvetica-Bold")
            .text("Thank You for Choosing Hotel Skardu!", 50, footerY + 20, {
            align: "center",
        });
        doc
            .fontSize(11)
            .fillColor("#64748b")
            .font("Helvetica")
            .text("We hope you enjoyed your stay with us. Please visit again!", 50, footerY + 40, { align: "center" });
        // Contact information
        doc
            .fontSize(10)
            .fillColor("#9ca3af")
            .font("Helvetica")
            .text(`For any queries, please contact us: ${this.hotelInfo.phone} | ${this.hotelInfo.email}`, 50, footerY + 60, { align: "center" })
            .text("This is a computer-generated invoice. No signature required.", 50, footerY + 80, { align: "center" });
    }
    async createInvoicePDF(invoiceId) {
        let invoiceData;
        if (invoiceId) {
            // Get real invoice data from database
            const realInvoice = await this.getInvoiceFromDatabase(invoiceId);
            if (!realInvoice) {
                throw new Error(`Invoice with ID ${invoiceId} not found`);
            }
            invoiceData = realInvoice;
        }
        else {
            throw new Error("Invoice ID is required");
        }
        const doc = new pdfkit_1.default({
            margin: 0,
            size: "A4",
            layout: "portrait",
        });
        const filename = `Invoice_${invoiceData.id}_${new Date().toISOString().split("T")[0]}.pdf`;
        const filepath = path.join(this.getDownloadsPath(), filename);
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);
        // Draw all sections
        this.drawHeader(doc);
        this.drawInvoiceTitle(doc, invoiceData);
        this.drawGuestInformation(doc, invoiceData);
        this.drawChargesTable(doc, invoiceData);
        this.drawFooter(doc);
        doc.end();
        return new Promise((resolve, reject) => {
            stream.on("finish", () => resolve(filepath));
            stream.on("error", reject);
        });
    }
    async createHotelReportPDF() {
        const doc = new pdfkit_1.default({
            margin: 50,
            size: "A4",
        });
        const filename = `Hotel_Skardu_Report_${new Date().toISOString().split("T")[0]}.pdf`;
        const filepath = path.join(this.getDownloadsPath(), filename);
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);
        // Header
        doc
            .fontSize(24)
            .font("Helvetica-Bold")
            .fillColor("#1e3a8a")
            .text(this.hotelInfo.name, { align: "center" })
            .moveDown(0.5);
        doc
            .fontSize(12)
            .font("Helvetica")
            .fillColor("#6b7280")
            .text(this.hotelInfo.tagline, { align: "center" })
            .moveDown(1);
        // Report title
        doc
            .fontSize(20)
            .font("Helvetica-Bold")
            .fillColor("#111827")
            .text("HOTEL MANAGEMENT REPORT", { align: "center" })
            .moveDown(1);
        doc
            .fontSize(10)
            .font("Helvetica")
            .fillColor("#6b7280")
            .text(`Generated on: ${new Date().toLocaleString()}`, { align: "center" })
            .moveDown(2);
        // Report content
        doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .fillColor("#1e3a8a")
            .text("Daily Statistics")
            .moveDown(0.5);
        doc
            .fontSize(10)
            .font("Helvetica")
            .fillColor("#374151")
            .text("Total Rooms: 50")
            .text("Occupied Rooms: 42")
            .text("Occupancy Rate: 84%")
            .text("Total Revenue: Rs. 25,680.00")
            .text("Average Daily Rate: Rs. 305.71")
            .moveDown(1);
        doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .fillColor("#1e3a8a")
            .text("Monthly Overview")
            .moveDown(0.5);
        doc
            .fontSize(10)
            .font("Helvetica")
            .fillColor("#374151")
            .text("Total Bookings: 156")
            .text("Revenue Generated: Rs. 789,450.00")
            .text("Average Guest Rating: 4.8/5")
            .text("Most Popular Room Type: Deluxe Mountain View")
            .moveDown(1);
        // Footer
        doc
            .fontSize(10)
            .font("Helvetica")
            .fillColor("#6b7280")
            .text("This report was automatically generated by Hotel Skardu Management System.", { align: "center" });
        doc.end();
        return new Promise((resolve, reject) => {
            stream.on("finish", () => resolve(filepath));
            stream.on("error", reject);
        });
    }
    getAvailablePDFTypes() {
        return [
            {
                id: "invoice",
                name: "Professional Invoice",
                description: "Generate a detailed, professional invoice with comprehensive information",
            },
            {
                id: "report",
                name: "Hotel Management Report",
                description: "Generate a comprehensive hotel management report with statistics and analytics",
            },
        ];
    }
    async createPDF(type, invoiceId) {
        switch (type) {
            case "invoice":
                return await this.createInvoicePDF(invoiceId);
            case "report":
                return await this.createHotelReportPDF();
            default:
                throw new Error(`Unknown PDF type: ${type}`);
        }
    }
}
exports.default = PDFCreator;
