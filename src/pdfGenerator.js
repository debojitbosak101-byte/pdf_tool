import { PDFDocument, rgb } from 'pdf-lib';

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

export async function generateLabelPDF(formData, randomQuote) {
  const A5_WIDTH = 420;
  const A5_HEIGHT = 595;
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage([A5_WIDTH, A5_HEIGHT]);

  const black = rgb(0, 0, 0);
  const white = rgb(1, 1, 1);
  const gray = rgb(0.95, 0.95, 0.95);
  const darkGray = rgb(0.15, 0.15, 0.15);

  const fontRegular = await pdfDoc.embedFont('Helvetica');
  const fontBold = await pdfDoc.embedFont('Helvetica-Bold');
  const fontItalic = await pdfDoc.embedFont('Helvetica-Oblique');

  const wrapText = (text, font, size, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (font.widthOfTextAtSize(testLine, size) <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  };

  page.drawRectangle({
    x: 15,
    y: 15,
    width: A5_WIDTH - 30,
    height: A5_HEIGHT - 30,
    borderColor: black,
    borderWidth: 1,
    color: white
  });

  page.drawText('SHIPPING DETAILS', {
    x: A5_WIDTH / 2 - 80,
    y: A5_HEIGHT - 45,
    size: 16 * 1.5,
    color: black,
    font: fontBold
  });

  page.drawLine({
    start: { x: 20, y: A5_HEIGHT - 55 },
    end: { x: A5_WIDTH - 20, y: A5_HEIGHT - 55 },
    thickness: 1,
    color: black
  });

  // SHIP TO at the top
  page.drawText('SHIP TO:', {
    x: 25,
    y: A5_HEIGHT - 75,
    size: 10 * 1.5,
    color: black,
    font: fontBold
  });

  const toLines = formData.toAddress
    .split('\n')
    .filter(Boolean)
    .flatMap((line, index) =>
      wrapText(line, index === 0 ? fontBold : fontRegular, index === 0 ? 12 * 1.5 : 10 * 1.5, A5_WIDTH - 50)
    );

  let yPos = A5_HEIGHT - 90;
  let firstLine = true;
  for (const line of toLines.slice(0, 8)) {
    page.drawText(line, {
      x: firstLine ? 30 : 35,
      y: yPos,
      size: firstLine ? 12 * 1.5 : 10 * 1.5,
      color: black,
      font: firstLine ? fontBold : fontRegular
    });
    yPos -= firstLine ? 14 * 1.5 : 12 * 1.5;
    firstLine = false;
  }

  const toSectionBottom = yPos - 15;

  page.drawLine({
    start: { x: 20, y: toSectionBottom },
    end: { x: A5_WIDTH - 20, y: toSectionBottom },
    thickness: 0.8,
    color: gray
  });

  // FROM address after gap
  page.drawText('FROM:', {
    x: 25,
    y: toSectionBottom - 20,
    size: 10 * 1.5,
    color: black,
    font: fontBold
  });

  const fromLines = formData.fromAddress
    .split('\n')
    .filter(Boolean)
    .flatMap(line => wrapText(line, fontRegular, 10 * 1.5, A5_WIDTH - 230));

  yPos = toSectionBottom - 35;
  for (const line of fromLines.slice(0, 6)) {
    page.drawText(line, {
      x: 30,
      y: yPos,
      size: 10 * 1.5,
      color: black,
      font: fontRegular
    });
    yPos -= 12 * 1.5;
  }

  // Document Number and Date under FROM address
  page.drawText(`Document Number: ${formData.documentNo}`, {
    x: 30,
    y: yPos - 10,
    size: 9 * 1.5,
    color: black,
    font: fontBold
  });

  page.drawText(`Date: ${formData.date}`, {
    x: 30,
    y: yPos - 25,
    size: 9 * 1.5,
    color: black,
    font: fontRegular
  });

  if (formData.weight) {
    page.drawText(`WT: ${formData.weight}`, {
      x: 30,
      y: yPos - 40,
      size: 9 * 1.5,
      color: black,
      font: fontRegular
    });
  }

  page.drawLine({
    start: { x: 20, y: yPos - 50 },
    end: { x: A5_WIDTH - 20, y: yPos - 50 },
    thickness: 0.8,
    color: gray
  });

  page.drawText('FOLLOW US: @suvams.co', {
    x: 25,
    y: 55,
    size: 9 * 1.5,
    color: black,
    font: fontRegular
  });

  const quoteLines = randomQuote.match(/.{1,60}/g) || [randomQuote];
  yPos = 40;
  for (const line of quoteLines.slice(0, 2)) {
    page.drawText(line, {
      x: 25,
      y: yPos,
      size: 8 * 1.5,
      color: darkGray,
      font: fontItalic
    });
    yPos -= 12 * 1.5;
  }

  return await pdfDoc.save();
}