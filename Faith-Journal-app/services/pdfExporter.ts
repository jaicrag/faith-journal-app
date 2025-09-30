import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { type Entry, EntryType, Status } from '../types';

const getStatusText = (status: Status | undefined, t: (key: string) => string) => {
    if (!status) return '';
    const statusMap: { [key in Status]: string } = {
        [Status.Pending]: t('pending'),
        [Status.InProgress]: t('inProgress'),
        [Status.Answered]: t('answered'),
    };
    return statusMap[status];
};

const getTypeText = (type: EntryType, t: (key: string) => string) => {
    const typeMap: { [key in EntryType]: string } = {
        [EntryType.Testimony]: t('testimony'),
        [EntryType.Gratitude]: t('gratitude'),
        [EntryType.PrayerRequest]: t('prayerRequest'),
    };
    return typeMap[type];
}


export const exportToPDF = (entries: Entry[], t: (key: string) => string) => {
  const doc = new jsPDF();
  const now = new Date();
  const formattedTimestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

  // Title
  doc.setFontSize(18);
  doc.text(t('pdfReportTitle'), 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`${t('generatedOn')}: ${formattedTimestamp}`, 14, 29);

  let y = 45;
  const pageHeight = doc.internal.pageSize.height;
  const bottomMargin = 15;
  const leftMargin = 14;
  const contentWidth = doc.internal.pageSize.width - (leftMargin * 2);

  const checkPageBreak = (requiredHeight: number) => {
      if (y + requiredHeight > pageHeight - bottomMargin) {
          doc.addPage();
          y = 20;
      }
  }

  entries.forEach((entry, index) => {
    const detailsLines = doc.splitTextToSize(entry.details, contentWidth).length;
    const estimatedHeight = 30 + (detailsLines * 5) + (entry.tags.length > 0 ? 8 : 0);
    checkPageBreak(estimatedHeight);
    
    if (index > 0) {
        doc.setDrawColor(224, 224, 224); // light grey line
        doc.line(leftMargin, y - 6, leftMargin + contentWidth, y - 6);
    }
    
    // Entry Header
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0);
    doc.text(entry.title || getTypeText(entry.type, t), leftMargin, y);
    y += 6;

    // Sub-header info
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    let subheader = `${entry.date} at ${entry.time} | For: ${entry.personName} | Type: ${getTypeText(entry.type, t)}`;
    if (entry.type === EntryType.PrayerRequest && entry.status) {
        subheader += ` | Status: ${getStatusText(entry.status, t)}`;
    }
    doc.text(subheader, leftMargin, y);
    y += 8;

    // Tags
    if (entry.tags && entry.tags.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.text('Tags:', leftMargin, y);
        doc.setFont(undefined, 'normal');
        doc.text(entry.tags.join(', '), leftMargin + 12, y);
        y += 8;
    }

    // Details
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(50);
    doc.text('Details:', leftMargin, y);
    y += 6;

    doc.setFont(undefined, 'normal');
    doc.setTextColor(80);
    const detailsText = doc.splitTextToSize(entry.details, contentWidth);
    doc.text(detailsText, leftMargin, y);
    y += detailsText.length * 5 + 8; // Add some padding after details
  });

  doc.save(`faith_journal_report_${now.toISOString().split('T')[0]}.pdf`);
};