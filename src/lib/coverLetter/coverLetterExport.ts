import toast from "react-hot-toast";
import { format } from "date-fns";

interface CoverLetterTemplate {
  id: string;
  name: string;
  description: string;
  language: "de" | "en";
  style: "formal" | "modern" | "creative";
  atsOptimized: boolean;
  din5008Compliant?: boolean;
}

interface ExportCoverLetterToPDFProps {
  element: HTMLElement;
  fileName: string;
  template: CoverLetterTemplate;
}

export const exportCoverLetterToPDF = async ({
  element,
  fileName,
  template,
}: ExportCoverLetterToPDFProps) => {
  try {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");

    const safeFileName = fileName
      .replace(/[^a-z0-9]/gi, "_")
      .replace(/__+/g, "_")
      .toLowerCase();

    const canvas = await html2canvas(element, {
      useCORS: true,
      logging: false,
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let position = 0;
    const pageMargin = 10;

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      position,
      imgWidth,
      imgHeight
    );
    heightLeft -= pageHeight - 2 * pageMargin;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight - 2 * pageMargin;
    }

    pdf.setProperties({
      title: `Anschreiben ${fileName}`,
      subject: "Cover Letter generated with Joatra",
      creator: "Joatra Cover Letter Generator",
      keywords: "cover letter, application, job application",
    });

    const pageCount = 1;
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);

      pdf.text(
        "Erstellt mit Joatra Anschreiben-Generator",
        pdf.internal.pageSize.getWidth() / 2,
        pdf.internal.pageSize.getHeight() - pageMargin,
        { align: "center" }
      );

      const currentDate = format(new Date(), "dd.MM.yyyy");
      pdf.text(
        currentDate,
        pdf.internal.pageSize.getWidth() - pageMargin,
        pdf.internal.pageSize.getHeight() - pageMargin,
        { align: "right" }
      );

      if (pageCount > 1) {
        pdf.text(
          `Seite ${i} von ${pageCount}`,
          pageMargin,
          pdf.internal.pageSize.getHeight() - pageMargin
        );
      }
    }

    pdf.save(`${safeFileName}.pdf`);
  } catch (error) {
    toast.error("Fehler beim PDF-Export");
    console.error("Error exporting cover letter to PDF:", error);
    throw error;
  }
};
