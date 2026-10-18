
import { jsPDF } from 'jspdf';
import { Certificate, User } from '../types';

export const generateCertificatePDF = (user: User, certificate: Certificate) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background color (dark theme feel)
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Border
  doc.setDrawColor(212, 175, 55); // Gold color
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
  doc.setLineWidth(0.5);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Logo Placeholder / Brand Name
  doc.setTextColor(212, 175, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(40);
  doc.text('ROONES', pageWidth / 2, 40, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('METODOLOGIA DE ALTO IMPACTO', pageWidth / 2, 48, { align: 'center' });

  // Main Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICADO DE CONCLUSÃO', pageWidth / 2, 80, { align: 'center' });

  // Body Text
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Certificamos que', pageWidth / 2, 100, { align: 'center' });

  // User Name
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(user.name.toUpperCase(), pageWidth / 2, 115, { align: 'center' });

  // Description
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  
  const descriptionText = certificate.pointsThreshold 
    ? `conquistou o reconhecimento "${certificate.title}"`
    : `concluiu com êxito a trilha de treinamento "${certificate.trackTitle || ''}"`;
    
  doc.text(descriptionText, pageWidth / 2, 130, { align: 'center' });
  
  doc.text('demonstrando proficiência e domínio dos conceitos apresentados.', pageWidth / 2, 140, { align: 'center' });

  // Date and Code
  doc.setFontSize(12);
  doc.setTextColor(150, 150, 150);
  const dateStr = new Date(certificate.issuedAt).toLocaleDateString('pt-BR');
  doc.text(`Emitido em: ${dateStr}`, 30, 175);
  doc.text(`Código de Autenticidade: ${certificate.code}`, 30, 182);

  // Signature line
  doc.setDrawColor(150, 150, 150);
  doc.line(pageWidth - 90, 175, pageWidth - 30, 175);
  doc.setTextColor(255, 255, 255);
  doc.text('Diretoria Roones', pageWidth - 60, 182, { align: 'center' });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Este certificado é um documento oficial emitido pela plataforma Roones.', pageWidth / 2, pageHeight - 15, { align: 'center' });

  // Save the PDF
  const fileName = (certificate.title || certificate.trackTitle || 'Certificado').replace(/\s+/g, '_');
  doc.save(`Certificado_Roones_${fileName}.pdf`);
};
