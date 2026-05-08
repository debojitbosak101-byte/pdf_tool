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

  page.drawText('SHIPPING LABEL', {
    x: 25,
    y: A5_HEIGHT - 45,
    size: 16,
    color: black,
    font: fontBold
  });

  page.drawLine({
    start: { x: 20, y: A5_HEIGHT - 55 },
    end: { x: A5_WIDTH - 20, y: A5_HEIGHT - 55 },
    thickness: 1,
    color: black
  });

  page.drawText('FROM:', {
    x: 25,
    y: A5_HEIGHT - 75,
    size: 10,
    color: black,
    font: fontBold
  });

  const fromLines = formData.fromAddress
    .split('\n')
    .filter(Boolean)
    .flatMap(line => wrapText(line, fontRegular, 10, A5_WIDTH - 230));

  let yPos = A5_HEIGHT - 105;
  for (const line of fromLines.slice(0, 6)) {
    page.drawText(line, {
      x: 30,
      y: yPos,
      size: 10,
      color: black,
      font: fontRegular
    });
    yPos -= 12;
  }

  const fromSectionBottom = yPos - 10;

  page.drawText(`Docket No: ${formData.documentNo}`, {
    x: A5_WIDTH - 170,
    y: A5_HEIGHT - 80,
    size: 9,
    color: black,
    font: fontBold
  });

  page.drawText(`Date: ${formData.date}`, {
    x: A5_WIDTH - 170,
    y: A5_HEIGHT - 95,
    size: 9,
    color: black,
    font: fontRegular
  });

  if (formData.weight) {
    page.drawText(`WT: ${formData.weight}`, {
      x: A5_WIDTH - 170,
      y: A5_HEIGHT - 110,
      size: 9,
      color: black,
      font: fontRegular
    });
  }

  page.drawLine({
    start: { x: 20, y: fromSectionBottom },
    end: { x: A5_WIDTH - 20, y: fromSectionBottom },
    thickness: 0.8,
    color: gray
  });

  const shipToStartY = fromSectionBottom - 20;
  page.drawText('SHIP TO:', {
    x: 25,
    y: shipToStartY,
    size: 10,
    color: black,
    font: fontBold
  });

  yPos = shipToStartY - 15;

  const toLines = formData.toAddress
    .split('\n')
    .filter(Boolean)
    .flatMap((line, index) =>
      wrapText(line, index === 0 ? fontBold : fontRegular, index === 0 ? 12 : 10, A5_WIDTH - 50)
    );

  let firstLine = true;
  for (const line of toLines.slice(0, 8)) {
    page.drawText(line, {
      x: firstLine ? 30 : 35,
      y: yPos,
      size: firstLine ? 12 : 10,
      color: black,
      font: firstLine ? fontBold : fontRegular
    });
    yPos -= firstLine ? 14 : 12;
    firstLine = false;
  }

  const toSectionBottom = yPos - 10;
  page.drawLine({
    start: { x: 20, y: toSectionBottom },
    end: { x: A5_WIDTH - 20, y: toSectionBottom },
    thickness: 1,
    color: black
  });

  page.drawText('TRACKING CODE', {
    x: 25,
    y: toSectionBottom - 20,
    size: 10,
    color: black,
    font: fontBold
  });

  const barcodeText = formData.documentNo;
  page.drawText(barcodeText, {
    x: 25,
    y: toSectionBottom - 35,
    size: 9,
    color: black,
    font: fontRegular
  });

  const barcodeStartX = 25;
  const barcodeStartY = A5_HEIGHT - 320;
  const stripeHeight = 38;
  const stripeWidth = 2;

  // Generate barcode pattern based on docket number
  const docketNum = formData.documentNo.replace(/\D/g, ''); // Remove non-digits
  const barcodePattern = [];

  // Start with quiet zone (white stripes)
  for (let i = 0; i < 3; i++) barcodePattern.push(0);

  // Add start pattern
  barcodePattern.push(1, 0, 1, 0);

  // Encode each digit
  for (const char of docketNum) {
    const digit = parseInt(char);
    // Simple encoding: alternate based on digit value
    for (let j = 0; j < 4; j++) {
      barcodePattern.push(digit % 2 === j % 2 ? 1 : 0);
    }
  }

  // Add stop pattern
  barcodePattern.push(1, 0, 1, 0);

  // End with quiet zone
  for (let i = 0; i < 3; i++) barcodePattern.push(0);

  // Draw the barcode
  for (let i = 0; i < Math.min(barcodePattern.length, 38); i++) {
    const x = barcodeStartX + i * stripeWidth;
    const isBlack = barcodePattern[i] === 1;
    page.drawRectangle({
      x,
      y: barcodeStartY,
      width: stripeWidth,
      height: stripeHeight,
      color: isBlack ? black : white
    });
  }

  page.drawText(`DOCKET NO: ${formData.documentNo}`, {
    x: 25,
    y: A5_HEIGHT - 340,
    size: 8,
    color: black,
    font: fontRegular
  });

  page.drawLine({
    start: { x: 20, y: A5_HEIGHT - 350 },
    end: { x: A5_WIDTH - 20, y: A5_HEIGHT - 350 },
    thickness: 0.8,
    color: gray
  });

  const quoteLines = randomQuote.match(/.{1,60}/g) || [randomQuote];
  yPos = A5_HEIGHT - 360;
  for (const line of quoteLines.slice(0, 4)) {
    page.drawText(line, {
      x: 25,
      y: yPos,
      size: 8,
      color: darkGray,
      font: fontItalic
    });
    yPos -= 10;
  }

  page.drawText('FOLLOW US: @suvams.co', {
    x: 25,
    y: 30,
    size: 9,
    color: black,
    font: fontRegular
  });

  return await pdfDoc.save();
}