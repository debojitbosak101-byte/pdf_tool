import { PDFDocument } from 'pdf-lib';

export async function addLetterheadToInvoice(invoiceArrayBuffer) {
  const finalPdf = await PDFDocument.create();

  // Load invoice correctly
  const invoiceDoc = await PDFDocument.load(invoiceArrayBuffer);
  const invoicePages = invoiceDoc.getPages();

  // Load letterhead
  const lhBytes = await fetch('/LH.pdf').then(res => res.arrayBuffer());
  const lhDoc = await PDFDocument.load(lhBytes);

  // Embed LH page
  const [lhPageEmbedded] = await finalPdf.embedPdf(lhBytes, [0]);

  for (let i = 0; i < invoicePages.length; i++) {
    // Embed each invoice page ONE BY ONE (this is the fix)
    const [embeddedInvPage] = await finalPdf.embedPdf(
      invoiceArrayBuffer,
      [i]
    );

    const { width, height } = embeddedInvPage;

    const page = finalPdf.addPage([width, height]);

    // Draw invoice first
    page.drawPage(embeddedInvPage, {
      x: 0,
      y: 0,
      width,
      height
    });

    // Draw letterhead on top
    page.drawPage(lhPageEmbedded, {
      x: 0,
      y: 0,
      width,
      height,
      opacity: 0.2
    });
  }

  return await finalPdf.save();
}