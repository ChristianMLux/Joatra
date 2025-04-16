import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { UserProfile, Job } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: "25mm 20mm 20mm 20mm",
    fontSize: 11,
    fontFamily: "Times-Roman",
    lineHeight: 1.5,
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  senderLine: {
    fontSize: 8,
    position: "absolute",
    top: "15mm",
    left: "20mm",
    right: "20mm",
    textAlign: "left",
    color: "#333333",
  },
  recipientBlock: {
    marginBottom: "10mm",
    fontSize: 11,
    lineHeight: 1.3,
  },
  dateLine: {
    textAlign: "right",
    marginBottom: "10mm",
    fontSize: 11,
  },
  subjectLine: {
    fontWeight: "bold",
    fontFamily: "Times-Bold",
    marginBottom: "8mm",
    fontSize: 11,
  },
  salutation: {
    marginBottom: "5mm",
    fontSize: 11,
  },
  paragraph: {
    marginBottom: "4mm",
    textAlign: "justify",
    fontSize: 11,
  },
  closing: {
    marginTop: "8mm",
    fontSize: 11,
  },
  signatureSpace: {
    height: "15mm",
  },
  signatureName: {
    fontSize: 11,
  },
});

interface CoverLetterPdfDocumentProps {
  profile: UserProfile;
  job?: Job | null;
  content: any;
  template: {
    language: "de" | "en";
    style: "formal" | "modern" | "creative";
    din5008Compliant?: boolean;
  };
}

const CoverLetterPdfDocument: React.FC<CoverLetterPdfDocumentProps> = ({
  profile,
  job,
  content,
  template,
}) => {
  const fontFamily = template.style === "formal" ? "Times-Roman" : "Helvetica";
  const safeFontFamily = Font.getRegisteredFontFamilies().includes(fontFamily)
    ? fontFamily
    : "Helvetica";

  if (
    !profile ||
    !content ||
    !content.personalDetailsBlock ||
    !content.companyAddressBlock ||
    !content.date ||
    !content.subject ||
    !content.salutation ||
    !content.introduction ||
    !content.mainBody ||
    !content.closing
  ) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>
            Error: Missing essential content for Cover Letter PDF generation.
          </Text>
        </Page>
      </Document>
    );
  }

  const closingParts = content.closing?.split(/\n\s*\n/) || [];
  const closingGreeting = closingParts[0] || "";
  const closingName =
    closingParts[closingParts.length - 1] ||
    `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`;

  return (
    <Document
      title={`Anschreiben_${profile.personalDetails.firstName}_${profile.personalDetails.lastName}`}
      author="Joatra Cover Letter Generator"
    >
      <Page size="A4" style={{ ...styles.page, fontFamily: safeFontFamily }}>
        {/* Sender Line (Rücksendeangabe) */}
        <Text style={styles.senderLine}>
          {`${profile.personalDetails.firstName} ${profile.personalDetails.lastName} · ${profile.personalDetails.address || ""} · ${profile.personalDetails.postalCode || ""} ${profile.personalDetails.city || ""}`}
        </Text>

        {/* Recipient */}
        <View style={styles.recipientBlock}>
          {content.companyAddressBlock
            .split("\n")
            .map((line: string, index: number) => (
              <Text key={`addr-${index}`}>{line}</Text>
            ))}
        </View>

        {/* Date */}
        <Text style={styles.dateLine}>{content.date}</Text>

        {/* Subject */}
        <Text style={styles.subjectLine}>{content.subject}</Text>

        {/* Salutation */}
        <Text style={styles.salutation}>{content.salutation}</Text>

        {/* Introduction */}
        <Text style={styles.paragraph}>{content.introduction}</Text>

        {/* Main Body - Split into paragraphs */}
        {content.mainBody
          ?.split(/\n\s*\n/)
          .map((paragraph: string, index: number) => (
            <Text key={`body-${index}`} style={styles.paragraph}>
              {paragraph.trim()}
            </Text>
          ))}

        {/* Closing */}
        <View style={styles.closing}>
          <Text>{closingGreeting}</Text>
          <View style={styles.signatureSpace} />
          <Text style={styles.signatureName}>{closingName}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default CoverLetterPdfDocument;
