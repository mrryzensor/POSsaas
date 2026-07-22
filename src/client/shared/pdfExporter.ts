import jsPDF from 'jspdf';

export function generateReceiptPDF(order: any, lines: any[] = []) {
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 150], // Receipt format (80mm width)
  });

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('POS SAAS PRO', 40, 10, { align: 'center' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Sede Central - Caja 01', 40, 15, { align: 'center' });
  doc.text('Operador: daviex14@gmail.com', 40, 19, { align: 'center' });

  doc.setLineWidth(0.3);
  doc.line(5, 22, 75, 22);

  doc.setFontSize(8);
  doc.text(`Orden #: ${order.id}`, 5, 27);
  doc.text(`Fecha: ${new Date(order.createdAt).toLocaleString()}`, 5, 31);
  doc.text(`Metodo Pago: ${order.paymentMethod}`, 5, 35);

  doc.line(5, 38, 75, 38);

  let y = 43;
  doc.setFont('Helvetica', 'bold');
  doc.text('Cant', 5, y);
  doc.text('Descripcion', 18, y);
  doc.text('Total', 75, y, { align: 'right' });

  y += 3;
  doc.setFont('Helvetica', 'normal');

  if (lines && lines.length > 0) {
    lines.forEach((line) => {
      doc.text(`${line.quantity}`, 5, y);
      const name = line.itemName.length > 22 ? line.itemName.substring(0, 20) + '..' : line.itemName;
      doc.text(name, 18, y);
      doc.text(`$${line.subtotal.toFixed(2)}`, 75, y, { align: 'right' });
      y += 4;
    });
  } else {
    doc.text('Detalles procesados en sistema', 18, y);
    y += 4;
  }

  doc.line(5, y + 2, 75, y + 2);
  y += 7;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL:', 5, y);
  doc.text(`$${order.total.toFixed(2)} USD`, 75, y, { align: 'right' });

  y += 10;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('¡Gracias por su compra!', 40, y, { align: 'center' });

  doc.save(`Recibo_${order.id}.pdf`);
}
