
import { jsPDF } from 'jspdf';
import { Module } from '../types';

export const generateModulePDF = (module: Module) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Header
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(212, 175, 55); // Gold
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('ROONES', margin, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('MATERIAL DE APOIO PARA IMPRESSÃO', margin, 32);

  // Title
  doc.setTextColor(15, 15, 15);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(module.title.toUpperCase(), margin, 55);

  // Description
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  const splitDescription = doc.splitTextToSize(module.description, contentWidth);
  doc.text(splitDescription, margin, 65);

  let currentY = 65 + (splitDescription.length * 7);

  // Content
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  // Simple markdown-to-text conversion (removing some common markdown symbols for the PDF)
  const cleanContent = module.content
    .replace(/#+\s/g, '') // Remove headers
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '')   // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remove links but keep text

  const splitContent = doc.splitTextToSize(cleanContent, contentWidth);
  
  // Check if content fits on one page, if not, add pages
  let linesPerPage = Math.floor((pageHeight - margin - currentY) / 7);
  let startLine = 0;

  while (startLine < splitContent.length) {
    const linesToPrint = splitContent.slice(startLine, startLine + linesPerPage);
    doc.text(linesToPrint, margin, currentY + 10);
    
    startLine += linesPerPage;
    
    if (startLine < splitContent.length) {
      doc.addPage();
      currentY = margin;
      linesPerPage = Math.floor((pageHeight - margin * 2) / 7);
    }
  }

  // Footer on last page
  const finalPage = doc.internal.pages.length - 1;
  doc.setPage(finalPage);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('© Roones Soluções Integradas - Todos os direitos reservados.', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save the PDF
  doc.save(`Modulo_${module.title.replace(/\s+/g, '_')}.pdf`);
};
