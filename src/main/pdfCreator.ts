import PDFDocument from "pdfkit";
import * as fs from "fs";
import * as path from "path";
import { app } from "electron";
import HotelDatabase from "./database";

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  guestName: string;
  roomNumber: string;
  roomType: string;
  nights: number;
  rate: number;
  subtotal: number;
  tax: number;
  total: number;
}

class PDFCreator {
  private hotelInfo = {
    name: "Grand Luxury Hotel",
    address: "123 Luxury Avenue, Downtown City, DC 12345",
    phone: "+1 (555) 123-4567",
    email: "info@grandluxuryhotel.com",
  };

  constructor() {
    this.ensureDownloadsDirectory();
  }

  private ensureDownloadsDirectory() {
    const downloadsPath = path.join(
      app.getPath("downloads"),
      "Hotel-Management-PDFs"
    );
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true });
    }
  }

  private getDownloadsPath(): string {
    return path.join(app.getPath("downloads"), "Hotel-Management-PDFs");
  }

  private generateMockInvoiceData(): InvoiceData {
    return {
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      guestName: "John Smith",
      roomNumber: "301",
      roomType: "Deluxe King Suite",
      nights: 2,
      rate: 200.0,
      subtotal: 400.0,
      tax: 32.0,
      total: 432.0,
    };
  }

  private async getInvoiceFromDatabase(invoiceId: string): Promise<any> {
    const db = new HotelDatabase();
    const invoices = db.getAllInvoices();
    return invoices.find((invoice) => invoice.invoiceId === invoiceId);
  }

  private convertInvoiceToPDFData(invoice: any): InvoiceData {
    const guestInfo =
      typeof invoice.guestInfo === "string"
        ? JSON.parse(invoice.guestInfo)
        : invoice.guestInfo;

    const roomInfo =
      typeof invoice.roomInfo === "string"
        ? JSON.parse(invoice.roomInfo)
        : invoice.roomInfo;

    return {
      invoiceNumber: invoice.id,
      date: new Date(invoice.date).toLocaleDateString(),
      guestName: guestInfo.name || "Unknown Guest",
      roomNumber: roomInfo.roomNumber || "N/A",
      roomType: roomInfo.roomType || "N/A",
      nights: roomInfo.nights || 1,
      rate: roomInfo.pricePerNight || 0,
      subtotal: invoice.subtotal || 0,
      tax: invoice.tax || 0,
      total: invoice.total || 0,
    };
  }

  async createInvoicePDF(invoiceId?: string): Promise<string> {
    let invoiceData: InvoiceData;

    if (invoiceId) {
      // Get real invoice data from database
      const realInvoice = await this.getInvoiceFromDatabase(invoiceId);
      if (!realInvoice) {
        throw new Error(`Invoice with ID ${invoiceId} not found`);
      }
      invoiceData = this.convertInvoiceToPDFData(realInvoice);
    } else {
      // Use mock data if no invoice ID provided
      invoiceData = this.generateMockInvoiceData();
    }

    const doc = new PDFDocument({ margin: 50 });
    const filename = `Invoice_${invoiceData.invoiceNumber}.pdf`;
    const filepath = path.join(this.getDownloadsPath(), filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(this.hotelInfo.name, { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(this.hotelInfo.address, { align: "center" })
      .text(`Phone: ${this.hotelInfo.phone}`, { align: "center" })
      .moveDown(1);

    // Invoice title
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("INVOICE", { align: "center" })
      .moveDown(1);

    // Invoice details
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Invoice Number: ${invoiceData.invoiceNumber}`)
      .text(`Date: ${invoiceData.date}`)
      .moveDown(1);

    // Guest information
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Guest Information")
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Name: ${invoiceData.guestName}`)
      .text(`Room Number: ${invoiceData.roomNumber}`)
      .text(`Room Type: ${invoiceData.roomType}`)
      .text(`Nights: ${invoiceData.nights}`)
      .moveDown(1);

    // Charges
    doc.fontSize(14).font("Helvetica-Bold").text("Charges").moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        `Room Rate (${
          invoiceData.nights
        } nights): $${invoiceData.subtotal.toFixed(2)}`
      )
      .text(`Tax: $${invoiceData.tax.toFixed(2)}`)
      .text(`Total: $${invoiceData.total.toFixed(2)}`)
      .moveDown(1);

    // Footer
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Thank you for choosing Grand Luxury Hotel!", { align: "center" });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on("finish", () => resolve(filepath));
      stream.on("error", reject);
    });
  }

  async createHotelReportPDF(): Promise<string> {
    const doc = new PDFDocument({ margin: 50 });
    const filename = `Hotel_Report_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    const filepath = path.join(this.getDownloadsPath(), filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(this.hotelInfo.name, { align: "center" })
      .moveDown(1);

    // Report title
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("HOTEL MANAGEMENT REPORT", { align: "center" })
      .moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Generated on: ${new Date().toLocaleString()}`)
      .moveDown(1);

    // Mock data
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Daily Statistics")
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Total Rooms: 100")
      .text("Occupied Rooms: 85")
      .text("Occupancy Rate: 85%")
      .text("Total Revenue: $45,250.00")
      .text("Average Daily Rate: $225.00")
      .moveDown(1);

    // Footer
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("This report was automatically generated.", { align: "center" });

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
        name: "Invoice",
        description: "Generate a detailed invoice for a guest",
      },
      {
        id: "report",
        name: "Hotel Report",
        description: "Generate a comprehensive hotel management report",
      },
    ];
  }

  async createPDF(type: string, invoiceId?: string): Promise<string> {
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

export default PDFCreator;
