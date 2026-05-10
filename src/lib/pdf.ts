import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Estimate, BusinessProfile } from '../types';
import { formatCurrency } from './utils';
import { format } from 'date-fns';

export const generateEstimatePDF = (estimate: Estimate, profile: BusinessProfile | null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('ORÇAMENTO', 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Nº: ${estimate.estimateNumber}`, 20, 38);
  doc.text(`Data: ${format(new Date(estimate.createdAt?.toDate?.() || new Date()), 'dd/MM/yyyy')}`, 20, 44);
  if (estimate.expiryDate) {
    doc.text(`Válido até: ${format(new Date(estimate.expiryDate), 'dd/MM/yyyy')}`, 20, 50);
  }

  // Business Info
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  const businessName = profile?.name || 'Sua Empresa';
  doc.text(businessName.toUpperCase(), pageWidth - 20, 30, { align: 'right' });
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  let y = 36;
  if (profile?.email) { doc.text(profile.email, pageWidth - 20, y, { align: 'right' }); y += 5; }
  if (profile?.phone) { doc.text(profile.phone, pageWidth - 20, y, { align: 'right' }); y += 5; }
  if (profile?.address) { doc.text(profile.address, pageWidth - 20, y, { align: 'right' }); y += 5; }

  // Client Info
  doc.setDrawColor(241, 245, 249); // slate-100
  doc.line(20, 65, pageWidth - 20, 65);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('CLIENTE', 20, 75);
  
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(estimate.clientName, 20, 82);
  doc.setFont('helvetica', 'normal');

  // Items Table
  autoTable(doc, {
    startY: 95,
    head: [['Descrição', 'Qtd', 'Unitário', 'Total']],
    body: estimate.items.map(item => [
      item.name,
      item.quantity,
      formatCurrency(item.unitPrice),
      formatCurrency(item.total)
    ]),
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    }
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', pageWidth - 70, finalY, { align: 'right' });
  doc.text(formatCurrency(estimate.subtotal), pageWidth - 20, finalY, { align: 'right' });
  
  if (estimate.discount > 0) {
    doc.text('Desconto:', pageWidth - 70, finalY + 6, { align: 'right' });
    doc.text(`- ${formatCurrency(estimate.discount)}`, pageWidth - 20, finalY + 6, { align: 'right' });
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('TOTAL:', pageWidth - 70, finalY + 14, { align: 'right' });
  doc.text(formatCurrency(estimate.total), pageWidth - 20, finalY + 14, { align: 'right' });

  // Notes
  if (estimate.notes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', 20, finalY + 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(estimate.notes, 20, finalY + 36, { maxWidth: pageWidth - 40 });
  }

  // Footer Message
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Gerado por Orçamento Pro Explorer', pageWidth / 2, doc.internal.pageSize.height - 15, { align: 'center' });

  doc.save(`orcamento_${estimate.estimateNumber}.pdf`);
};
