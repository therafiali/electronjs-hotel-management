import PDFDocument from "pdfkit";
import * as fs from "fs";
import * as path from "path";
import { app } from "electron";
import HotelDatabase from "./database";

interface InvoiceData {
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

class PDFCreator {
  private hotelInfo = {
    name: "RAMA RESORT",
    tagline: "Luxury & Comfort in the Heart of Paradise",
    address: "Skardu Valley, Gilgit-Baltistan, Pakistan",
    phone: "+92-347-2930903",
    email: "ramaresortofficial@gmail.com",
    website: "www.ramaresort.com",
  };

    // === Monochrome palette ===
    private mono = {
      text: "#111111",
      muted: "#555555",
      hair: "#E6E6E6",
      light: "#F7F7F7",
      dark: "#000000",
    };

  constructor() {
    this.ensureDownloadsDirectory();
  }

  // Format invoice ID for display (converts long ID to nice format like RESORT-001)
  private formatInvoiceIdForDisplay(invoiceId: string): string {
    // Extract the random part and convert to a sequential number
    const parts = invoiceId.split('_');
    if (parts.length >= 3) {
      const randomPart = parts[2];
      // Convert the random string to a number for consistent display
      const hash = randomPart.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);
      const sequenceNumber = (hash % 999) + 1;
      return `RESORT-${sequenceNumber.toString().padStart(3, '0')}`;
    }
    return invoiceId; // Fallback to original if format is unexpected
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

  private async getInvoiceFromDatabase(invoiceId: string): Promise<any> {
    const db = new HotelDatabase();
    const invoices = db.getAllInvoices();
    const invoice = invoices.find((invoice) => invoice.invoiceId === invoiceId);

    if (!invoice) {
      throw new Error(`Invoice with ID ${invoiceId} not found`);
    }

    const transformedData = {
      id: invoice.invoiceId,
      guestInfo: invoice.guestInfo as any,
      roomInfo: {
        roomNumber: (invoice.roomInfo as any).roomNumber,
        roomType: (invoice.roomInfo as any).roomType,
        pricePerNight: (invoice.roomInfo as any).pricePerNight,
        nights: this.calculateNights(
          (invoice.guestInfo as any).checkIn,
          (invoice.guestInfo as any).checkOut
        ),
      },
      foodItems: invoice.foodItems || [],
      taxRate: invoice.taxRate,
      discount: invoice.discount,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      date: invoice.date,
    };
        
    return transformedData;
  }


  private calculateNights(checkIn: string, checkOut: string): number {
    try {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays || 1; // Return at least 1 night
    } catch (error) {
      console.warn("Error calculating nights, defaulting to 1:", error);
      return 1;
    }
  }

  private getPossibleLogoPaths(): string[] {
    return [
      path.join(__dirname, "../renderer/components/img/logo.png"),
      path.join(__dirname, "../../src/renderer/components/img/logo.png"),
      path.join(
        __dirname,
        "../renderer/components/img/Rama Resort Logo White without BG .png"
      ),
      path.join(
        __dirname,
        "../../src/renderer/components/img/Rama Resort Logo White without BG .png"
      ),
      path.join(
        __dirname,
        "../renderer/components/img/Rama Resort Logo White without BG.png"
      ),
      path.join(
        __dirname,
        "../../src/renderer/components/img/Rama Resort Logo White without BG.png"
      ),
      path.join(__dirname, "../renderer/components/img/Rama Resort Logo.png"),
      path.join(
        __dirname,
        "../../src/renderer/components/img/Rama Resort Logo.png"
      ),
      path.join(__dirname, "../renderer/components/img/images.jpeg"),
      path.join(__dirname, "../../src/renderer/components/img/images.jpeg"),
    ];
  }

  private tryLoadLogo(doc: PDFKit.PDFDocument): boolean {
    const paths = this.getPossibleLogoPaths();
    for (const p of paths) {
      if (fs.existsSync(p)) {
        try {
          const buf = fs.readFileSync(p);
          const ext = path.extname(p).toLowerCase();
          if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
            // Draw a white background rectangle first to avoid transparency
            doc.rect(50, 34, 64, 64).fill("#FFFFFF");
            doc.image(buf, 50, 34, { width: 64, height: 64, fit: [64, 64] });
            return true;
          }
        } catch {
          // ignore and try next path
        }
      }
    }
    return false;
  }



  private drawHeader(doc: PDFKit.PDFDocument) {
    if (!this.tryLoadLogo(doc)) {
      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .fillColor(this.mono.text)
        .text("🏨", 50, 40);
    }

    // Right-side INVOICE tag (solid black)
    const tagW = 180,
      tagH = 28,
      x = 545 - 50 - tagW,
      y = 44;
    doc
      .save()
      .rect(x, y, tagW, tagH)
      .fill(this.mono.dark)
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .fontSize(15)
      .text("INVOICE", x, y + 6, { width: tagW, align: "center" })
      .restore();

    // Divider line
    doc
      .moveTo(50, 110)
      .lineTo(595 - 50, 110)
      .lineWidth(0.8)
      .strokeColor("#000000")
      .stroke();
  }

  // === Invoice meta (same fields, cleaner style) ===
  private drawInvoiceTitle(doc: PDFKit.PDFDocument, invoiceData: InvoiceData) {
    const left = 50,
      top = 120,
      lh = 16;

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(this.mono.text)
      .text("Invoice Number", left, top);
    doc
      .font("Helvetica")
      .fillColor(this.mono.muted)
      .text(
        this.formatInvoiceIdForDisplay(invoiceData.id) || "N/A",
        left,
        top + lh
      );

    doc.font("Helvetica-Bold").fillColor(this.mono.text).text("Date", left, top + 2 * lh);
    doc
      .font("Helvetica")
      .fillColor(this.mono.muted)
      .text(
        invoiceData.date
          ? new Date(invoiceData.date).toLocaleDateString()
          : "N/A",
        left,
        top + 3 * lh
      );

    doc
      .font("Helvetica-Bold")
      .fillColor(this.mono.text)
      .text("Payment Status", left, top + 4 * lh);
    doc.font("Helvetica").fillColor(this.mono.muted).text("PAID", left, top + 5 * lh);

    // divider line
    doc
      .moveTo(50, 230)
      .lineTo(595 - 50, 230)
      .lineWidth(0.8)
      .strokeColor("#000000")
      .stroke();
  }
  

  // === Guest & Room sections (same logic, refined visuals) ===
  private drawGuestInformation(doc: PDFKit.PDFDocument, invoiceData: InvoiceData) {
    // Guest Information Section
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor(this.mono.dark)
      .text("Guest Information", 50, 250);

    const guestBoxH = invoiceData.roomInfo?.roomNumber ? 72 : 36; // 2 lines vs 4 lines
    doc
      .rect(50, 270, 250, guestBoxH)
      .fillAndStroke("#ffffff");

    let y = 270;
    const labelX = 50;
    const valueX = 160;

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(this.mono.text)
      .text("Guest Name:", labelX, y)
      .text("Phone Number:", labelX, y + 18);

    doc
      .font("Helvetica")
      .fillColor(this.mono.muted)
      .text(invoiceData.guestInfo.name || "N/A", valueX, y)
      .text(invoiceData.guestInfo.phone || "N/A", valueX, y + 18);

    // Only show check-in/check-out dates if room exists
    if (invoiceData.roomInfo?.roomNumber) {
      doc
        .font("Helvetica")
        .fillColor(this.mono.text)
        .text("Check-in Date:", labelX, y + 36)
        .text("Check-out Date:", labelX, y + 54);

      doc
        .font("Helvetica")
        .fillColor(this.mono.muted)
        .text(
          invoiceData.guestInfo.checkIn
            ? new Date(invoiceData.guestInfo.checkIn).toLocaleDateString()
            : "N/A",
          valueX,
          y + 36
        )
        .text(
          invoiceData.guestInfo.checkOut
            ? new Date(invoiceData.guestInfo.checkOut).toLocaleDateString()
            : "N/A",
          valueX,
          y + 54
        );
    }

    // Room Information Section - Only show if room exists
    if (invoiceData.roomInfo?.roomNumber) {
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor(this.mono.text)
        .text("Room Information", 330, 250);

      // Room details box
      doc
        .rect(330, 270, 215, 90)
        .fillAndStroke("#ffffff");

      const l = 330,
        v = 440;
      y = 270;

      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor(this.mono.text)
        .text("Room Number:", l, y)
        .text("Room Type:", l, y + 18)
        .text("Number of Nights:", l, y + 36)

      doc
        .font("Helvetica")
        .fillColor(this.mono.muted)
        .text(invoiceData.roomInfo.roomNumber || "N/A", v, y)
        .text(invoiceData.roomInfo.roomType || "N/A", v, y + 18)
       .text((invoiceData.roomInfo.nights || 1).toString(), v, y + 36)
       

        // divider line
    doc
    .moveTo(50, 380)
    .lineTo(595 - 50, 380)
    .lineWidth(0.8)
    .strokeColor("#000000")
    .stroke();
    }
  }

  // === Charges table (clean design with bold header) ===
  private drawChargesTable(doc: PDFKit.PDFDocument, invoiceData: InvoiceData) {
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor(this.mono.text)
      .text("Detailed Charges", 50, 400);

    const y0 = 420,
      col1 = 50,
      col2 = 320,
      col3 = 380,
      col4 = 460,
      rowH = 25;
    let y = y0;

    // Header with bold border
    doc.rect(col1, y, 495, rowH).fillAndStroke(this.mono.light, "#000000");
    doc
      .fillColor("#000000")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("Description", col1 + 10, y + 7)
      .text("Qty", col2 + 10, y + 7)
      .text("Unit Price", col3 + 10, y + 7)
      .text("Total", col4 + 10, y + 7);
    y += rowH;

    const row = (texts: [string, string, string, string]) => {
      doc.rect(col1, y, 495, rowH).fillAndStroke("#ffffff", "#CCCCCC");
      doc
        .fillColor(this.mono.text)
        .font("Helvetica")
        .fontSize(10)
        .text(texts[0], col1 + 10, y + 8)
        .text(texts[1], col2 + 10, y + 8)
        .text(texts[2], col3 + 10, y + 8)
        .text(texts[3], col4 + 10, y + 8);
      y += rowH;
    };

    // Room line (if room exists)
    if (invoiceData.roomInfo?.roomNumber) {
      const n = invoiceData.roomInfo.nights || 1;
      const r = invoiceData.roomInfo.pricePerNight || 0;
             row([
         `${invoiceData.roomInfo.roomType || "Room"} - ${invoiceData.roomInfo.roomNumber || ""}`,
         n.toString(),
         `${r.toFixed(2)}`,
         `${(n * r).toFixed(2)}`,
       ]);
    }

    // Food and Laundry items section
    if (invoiceData.foodItems?.length) {
      // Separate food and laundry items
      const foodItems = invoiceData.foodItems.filter((item) => {
        // Try to find the item in database to get category
        const db = new HotelDatabase();
        const items = db.getAllItems();
        const itemData = items.find(i => i.name === item.name);
        return itemData && itemData.category === 'Food';
      });
      
      const laundryItems = invoiceData.foodItems.filter((item) => {
        // Try to find the item in database to get category
        const db = new HotelDatabase();
        const items = db.getAllItems();
        const itemData = items.find(i => i.name === item.name);
        return itemData && itemData.category === 'Laundry';
      });

      // Other items (not food or laundry)
      const otherItems = invoiceData.foodItems.filter((item) => {
        const db = new HotelDatabase();
        const items = db.getAllItems();
        const itemData = items.find(i => i.name === item.name);
        return !itemData || (itemData.category !== 'Food' && itemData.category !== 'Laundry');
      });

      // Food section header
      if (foodItems.length > 0) {
        doc.rect(col1, y, 495, rowH).fillAndStroke(this.mono.light, "#000000");
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor(this.mono.text)
          .text("Food & Beverages", col1 + 10, y + 7);
        y += rowH;

                 foodItems.forEach((it) => {
           const qty = it.quantity || 0;
           const pr = it.price || 0;
           row([
             it.name || "Item",
             qty.toString().padStart(2, "0"),
             `${pr.toFixed(2)}`,
             `${(qty * pr).toFixed(2)}`,
           ]);
         });
      }

      // Laundry section header
      if (laundryItems.length > 0) {
        doc.rect(col1, y, 495, rowH).fillAndStroke(this.mono.light, "#000000");
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor(this.mono.text)
          .text("Laundry Services", col1 + 10, y + 7);
        y += rowH;

                 laundryItems.forEach((it) => {
           const qty = it.quantity || 0;
           const pr = it.price || 0;
           row([
             it.name || "Item",
             qty.toString().padStart(2, "0"),
             `${pr.toFixed(2)}`,
             `${(qty * pr).toFixed(2)}`,
           ]);
         });
      }

      // Other items section (if any)
      if (otherItems.length > 0) {
        doc.rect(col1, y, 495, rowH).fillAndStroke(this.mono.light, "#000000");
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .fillColor(this.mono.text)
          .text("Other Services", col1 + 10, y + 7);
        y += rowH;

                 otherItems.forEach((it) => {
           const qty = it.quantity || 0;
           const pr = it.price || 0;
           row([
             it.name || "Item",
             qty.toString().padStart(2, "0"),
             `${pr.toFixed(2)}`,
             `${(qty * pr).toFixed(2)}`,
           ]);
         });
      }
    }

    // Subtotal
    doc.rect(col1, y, 495, rowH).fill(this.mono.light).strokeColor(this.mono.hair).stroke();
         doc
       .font("Helvetica-Bold")
       .fontSize(10)
       .fillColor(this.mono.text)
       .text("Subtotal", col3 + 10, y + 8)
       .text(`${(invoiceData.subtotal || 0).toFixed(2)}`, col4 + 10, y + 8);
    y += rowH;

    // Tax
    doc.rect(col1, y, 495, rowH).fill(this.mono.light).strokeColor(this.mono.hair).stroke();
         doc
       .font("Helvetica-Bold")
       .fontSize(10)
       .fillColor(this.mono.text)
       .text(`Tax (${invoiceData.taxRate || 0}%)`, col3 + 10, y + 8)
       .text(`${(invoiceData.tax || 0).toFixed(2)}`, col4 + 10, y + 8);
    y += rowH;

    // Discount (if any)
    if ((invoiceData.discount || 0) > 0) {
      doc.rect(col1, y, 495, rowH).fill("#FAFAFA").strokeColor(this.mono.hair).stroke();
             doc
         .font("Helvetica-Bold")
         .fontSize(10)
         .fillColor(this.mono.text)
         .text("Discount", col3 + 10, y + 8)
         .text(`-${(invoiceData.discount || 0).toFixed(2)}`, col4 + 10, y + 8);
      y += rowH;
    }

    // Total emphasis bar (right)
    const totalY = y + 6;
    doc.rect(col3 + 10, totalY, 60, 26).fill(this.mono.dark);
    doc
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Total", col3 + 10, totalY + 7, { width: 60, align: "center" });
    doc
      .fillColor(this.mono.text)
      .font("Helvetica-Bold")
      .text(`Rs. ${(invoiceData.total || 0).toFixed(2)}`, col4 + 10, totalY + 7);

    // rule to separate from footer
    doc
      .moveTo(50, totalY + 45)
      .lineTo(595 - 50, totalY + 45)
      .lineWidth(0.8)
      .strokeColor("#000000")
      .stroke();
  }

  // === Footer (centered, monochrome) ===
  private drawFooter(doc: PDFKit.PDFDocument) {
    const pageH = 842,
      y = pageH - 70;

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(this.mono.text)
      .text("Thank you for choosing Rama Resort", 50, y + 12, { align: "center" });

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(this.mono.muted)
      .text(
        `${this.hotelInfo.phone}  |  ${this.hotelInfo.email}  |  ${this.hotelInfo.website}`,
        50,
        y + 28,
        { align: "center" }
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(this.mono.muted)
      .text(
        "This is a computer-generated invoice. No signature required.",
        50,
        y + 44,
        { align: "center" }
      );
  }

  // === Public creators ===
  async createInvoicePDF(invoiceId?: string): Promise<string> {
    let invoiceData: InvoiceData;

    if (invoiceId) {
      // Get real invoice data from database
      const realInvoice = await this.getInvoiceFromDatabase(invoiceId);
      if (!realInvoice) {
        throw new Error(`Invoice with ID ${invoiceId} not found`);
      }
      invoiceData = realInvoice;
    } else {
      throw new Error("Invoice ID is required");
    }

    const doc = new PDFDocument({
      margin: 0,
      size: "A4",
      layout: "portrait",
    });

    const filename = `Invoice_${this.formatInvoiceIdForDisplay(invoiceData.id)}_${
      new Date().toISOString().split("T")[0]
    }_${Date.now()}.pdf`;
    const filepath = path.join(this.getDownloadsPath(), filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Draw all sections (order preserved)
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

  async createHotelReportPDF(): Promise<string> {
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    const filename = `Rama_Resort_Report_${new Date()
      .toISOString()
      .split("T")[0]}_${Date.now()}.pdf`;
    const filepath = path.join(this.getDownloadsPath(), filename);

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor(this.mono.text)
      .text(this.hotelInfo.name, { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor(this.mono.muted)
      .text(this.hotelInfo.tagline, { align: "center" })
      .moveDown(1);

    // Report title
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor(this.mono.text)
      .text("HOTEL MANAGEMENT REPORT", { align: "center" })
      .moveDown(1);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(this.mono.muted)
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: "center" })
      .moveDown(2);

    // Report content (static example)
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor(this.mono.text)
      .text("Daily Statistics")
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(this.mono.text)
      .text("Total Rooms: 50")
      .text("Occupied Rooms: 42")
      .text("Occupancy Rate: 84%")
      .text("Total Revenue: Rs. 25,680.00")
      .text("Average Daily Rate: Rs. 305.71")
      .moveDown(1);

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor(this.mono.text)
      .text("Monthly Overview")
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(this.mono.text)
      .text("Total Bookings: 156")
      .text("Revenue Generated: Rs. 789,450.00")
      .text("Average Guest Rating: 4.8/5")
      .text("Most Popular Room Type: Deluxe Mountain View")
      .moveDown(1);

    // Footer
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(this.mono.muted)
      .text(
        "This report was automatically generated by Rama Resort Management System.",
        { align: "center" }
      );

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
        description:
          "Generate a detailed, professional invoice with comprehensive information",
      },
      {
        id: "report",
        name: "Hotel Management Report",
        description:
          "Generate a comprehensive hotel management report with statistics and analytics",
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