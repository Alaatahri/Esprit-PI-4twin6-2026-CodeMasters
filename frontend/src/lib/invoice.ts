import PDFDocument from 'pdfkit';

interface InvoiceData {
  orderNumber: string;
  date: Date;
  customerName: string;
  customerEmail: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  vatRate: number; // e.g. 0.19 for 19%
}

export function generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Header
      doc
        .fontSize(20)
        .text('INVOICE / FACTURE', { align: 'center' })
        .moveDown();

      // Company Info
      doc
        .fontSize(10)
        .text('B2B Construction Marketplace')
        .text('123 Build Street, Tunis')
        .text('Tax ID: 1234567M')
        .moveDown();

      // Invoice Info
      doc
        .text(`Invoice Number: ${invoiceData.orderNumber}`)
        .text(`Date: ${invoiceData.date.toLocaleDateString()}`)
        .text(`Customer: ${invoiceData.customerName} (${invoiceData.customerEmail})`)
        .moveDown();

      // Items Table Header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Description', 50, tableTop);
      doc.text('Qty', 300, tableTop);
      doc.text('Unit Price', 380, tableTop);
      doc.text('Total', 450, tableTop);
      doc.font('Helvetica');
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown();

      // Items
      let currentY = doc.y + 10;
      invoiceData.items.forEach(item => {
        doc.text(item.description, 50, currentY);
        doc.text(item.quantity.toString(), 300, currentY);
        doc.text(item.price.toFixed(2), 380, currentY);
        doc.text((item.quantity * item.price).toFixed(2), 450, currentY);
        currentY += 20;
      });

      // Totals
      const subtotal = invoiceData.totalAmount;
      const vatAmount = subtotal * invoiceData.vatRate;
      const total = subtotal + vatAmount;

      doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
      currentY += 15;

      doc.font('Helvetica-Bold');
      doc.text('Subtotal (HT):', 350, currentY);
      doc.text(subtotal.toFixed(2), 450, currentY);
      currentY += 20;

      doc.text(`VAT/TVA (${(invoiceData.vatRate * 100).toFixed(0)}%):`, 350, currentY);
      doc.text(vatAmount.toFixed(2), 450, currentY);
      currentY += 20;

      doc.text('Total (TTC):', 350, currentY);
      doc.text(total.toFixed(2), 450, currentY);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
