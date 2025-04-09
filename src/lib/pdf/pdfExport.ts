import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Job } from "../types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export interface ExportPDFProps {
  jobs: Job[];
  userName?: string;
}

export const exportJobsToPDF = ({
  jobs,
  userName = "Nutzer",
}: ExportPDFProps) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const statusCounts = countStatusOccurrences(jobs);
  const totalJobs = jobs.length;

  // Title
  doc.setFontSize(18);
  doc.setTextColor(33, 99, 235);
  doc.text(`Übersicht über Bewerbungen von ${userName}`, 14, 15);

  // Summary
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);

  let yPos = 22;
  doc.text(`Gesamtzahl: ${totalJobs}`, 14, yPos);

  Object.entries(statusCounts).forEach(([status, count], index) => {
    doc.text(`${status}: ${count}`, 75 + index * 40, yPos);
  });

  const tableData = jobs.map((job) => [
    job.company,
    job.jobTitle,
    job.status,
    job.contactPerson?.name || "-",
    job.location || "-",
    formatDate(job.applicationDate),
  ]);

  //table
  let finalY = 40;

  autoTable(doc, {
    head: [["Firma", "Position", "Status", "Kontakt", "Ort"]],
    body: tableData,
    startY: 30,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 60 },
      2: { cellWidth: 25 },
      3: { cellWidth: 35 },
      4: { cellWidth: 35 },
    },
    alternateRowStyles: {
      fillColor: [245, 250, 254],
    },
    didDrawPage: (data) => {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "Joatra - Job Application Tracker",
        14,
        doc.internal.pageSize.height - 10
      );

      const pageNumber = (doc as any).getNumberOfPages();
      doc.text(
        `Seite ${pageNumber}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
    },
    didDrawCell: (data) => {
      if (data.row.index === tableData.length - 1) {
        finalY = data.cell.y + data.cell.height + 15;
      }
    },
  });

  doc.save(`Bewerbungen_${userName.replace(/\s+/g, "_")}.pdf`);
};

const formatDate = (date: string | Date | any) => {
  if (!date) return "-";

  let dateObj: Date;

  if (typeof date === "object" && "toDate" in date) {
    dateObj = date.toDate();
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) {
    return "-";
  }

  return format(dateObj, "dd.MM.yyyy", { locale: de });
};

const countStatusOccurrences = (jobs: Job[]) => {
  const counts: Record<string, number> = {};

  jobs.forEach((job) => {
    counts[job.status] = (counts[job.status] || 0) + 1;
  });

  return counts;
};
