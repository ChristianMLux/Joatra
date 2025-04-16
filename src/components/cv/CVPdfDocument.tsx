import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link as PdfLink,
} from "@react-pdf/renderer";
import {
  UserProfile,
  Job,
  CVTemplate,
  Skill,
  Experience,
  Education,
  Language,
} from "@/lib/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

// --- Styling ---
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: "15mm",
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
    color: "#333333",
  },
  header: {
    textAlign: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111111",
    marginBottom: 5,
    fontFamily: "Helvetica-Bold",
  },
  contactInfo: {
    fontSize: 9,
    color: "#444444",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 4,
  },
  contactItem: {
    marginHorizontal: 4,
    marginBottom: 2,
  },
  contactLink: {
    marginHorizontal: 4,
    marginBottom: 2,
    color: "#003366",
    textDecoration: "none",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#003366",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingBottom: 3,
  },
  item: {
    marginBottom: 8,
    paddingLeft: 5,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    alignItems: "flex-start",
  },
  itemDetails: {
    flex: 1,
    paddingRight: 5,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    marginBottom: 1,
  },
  itemSubtitle: {
    fontSize: 10,
    color: "#222222",
  },
  itemDate: {
    fontSize: 9,
    color: "#555555",
    textAlign: "right",
    minWidth: 50,
  },
  itemDescription: {
    fontSize: 10,
    marginTop: 2,
    textAlign: "justify",
  },
  skillCategory: {
    fontSize: 10.5,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#444444",
    marginTop: 4,
    marginBottom: 2,
  },
  skillsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillItem: {
    fontSize: 9.5,
    marginRight: 4,
    marginBottom: 3,
    backgroundColor: "#f0f0f0",
    padding: "2px 5px",
    borderRadius: 3,
  },
  languageItem: {
    marginRight: 8,
    marginBottom: 2,
    fontSize: 10,
  },
});

const formatDateRange = (
  startDate: any,
  endDate: any,
  ongoing: boolean | undefined,
  lang: string = "de"
): string => {
  const formatStr = "MM/yyyy";
  const localeOptions = lang === "de" ? { locale: de } : undefined;

  const formatDatePart = (date: any): string => {
    if (!date) return "";
    let dateObj: Date;
    if (
      typeof date === "object" &&
      date !== null &&
      "toDate" in date &&
      typeof date.toDate === "function"
    ) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      try {
        dateObj = new Date(date);
      } catch {
        return "";
      }
    }
    if (isNaN(dateObj.getTime())) return "";
    try {
      return format(dateObj, formatStr, localeOptions);
    } catch (e) {
      console.error("Error formatting date:", date, e);
      return "Invalid Date";
    }
  };

  const start = formatDatePart(startDate);
  const end = ongoing
    ? lang === "de"
      ? "Heute"
      : "Present"
    : formatDatePart(endDate);

  if (start === "Invalid Date" || end === "Invalid Date")
    return "Invalid Date Range";
  if (!start && !end) return "";
  if (start && !end) return start;
  if (!start && end && !ongoing) return end;
  if (start && end) return `${start} - ${end}`;
  return "";
};

interface CVPdfDocumentProps {
  profile: UserProfile;
  job?: Job | null;
  content: any;
  template: CVTemplate;
}

const CVPdfDocument: React.FC<CVPdfDocumentProps> = ({
  profile,
  job,
  content,
  template,
}) => {
  if (!profile || !content) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>
            Error: Missing profile or content data for PDF generation.
          </Text>
        </Page>
      </Document>
    );
  }

  const experience = content.experience || [];
  const education = content.education || [];
  const skills = content.skills || [];
  const languages = content.languages || [];

  return (
    <Document
      title={`CV_${profile.personalDetails.firstName}_${profile.personalDetails.lastName}`}
      author="Joatra CV Generator"
    >
      <Page size="A4" style={styles.page}>
        {/* --- Header --- */}
        <View style={styles.header}>
          <Text
            style={styles.name}
          >{`${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`}</Text>
          <View style={styles.contactInfo}>
            {profile.personalDetails.email && (
              <Text style={styles.contactItem}>
                {profile.personalDetails.email}
              </Text>
            )}
            {profile.personalDetails.phone && (
              <Text style={styles.contactItem}>
                {profile.personalDetails.phone}
              </Text>
            )}
            {profile.personalDetails.address && (
              <Text style={styles.contactItem}>
                {[
                  profile.personalDetails.address,
                  `${profile.personalDetails.postalCode || ""} ${profile.personalDetails.city || ""}`.trim(),
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            )}
            {profile.personalDetails.linkedin && (
              <PdfLink
                style={styles.contactLink}
                src={profile.personalDetails.linkedin}
              >
                LinkedIn
              </PdfLink>
            )}
            {profile.personalDetails.website && (
              <PdfLink
                style={styles.contactLink}
                src={profile.personalDetails.website}
              >
                Website
              </PdfLink>
            )}
          </View>
        </View>

        {/* --- Summary --- */}
        {content.summary && (
          <View style={styles.section}>
            <Text style={{ ...styles.itemDescription, fontStyle: "italic" }}>
              {content.summary}
            </Text>
          </View>
        )}

        {/* --- Experience --- */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {template.language === "de" ? "Berufserfahrung" : "Experience"}
            </Text>
            {experience.map((exp: Experience, index: number) => (
              <View key={`exp-${index}`} style={styles.item} wrap={false}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemTitle}>{exp.position}</Text>
                    <Text
                      style={styles.itemSubtitle}
                    >{`${exp.company}${exp.location ? ` | ${exp.location}` : ""}`}</Text>
                  </View>
                  <Text style={styles.itemDate}>
                    {formatDateRange(
                      exp.startDate,
                      exp.endDate,
                      exp.ongoing,
                      template.language
                    )}
                  </Text>
                </View>
                {exp.description && (
                  <Text style={styles.itemDescription}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* --- Education --- */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {template.language === "de" ? "Ausbildung" : "Education"}
            </Text>
            {education.map((edu: Education, index: number) => (
              <View key={`edu-${index}`} style={styles.item} wrap={false}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemDetails}>
                    <Text
                      style={styles.itemTitle}
                    >{`${edu.degree}${edu.field ? ` in ${edu.field}` : ""}`}</Text>
                    <Text
                      style={styles.itemSubtitle}
                    >{`${edu.institution}${edu.location ? ` | ${edu.location}` : ""}`}</Text>
                  </View>
                  <Text style={styles.itemDate}>
                    {formatDateRange(
                      edu.startDate,
                      edu.endDate,
                      edu.ongoing,
                      template.language
                    )}
                  </Text>
                </View>
                {edu.description && (
                  <Text style={styles.itemDescription}>{edu.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* --- Skills --- */}
        {skills.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>
              {template.language === "de"
                ? "Kenntnisse & Fähigkeiten"
                : "Skills"}
            </Text>
            <View style={styles.skillsList}>
              {skills.map((skill: Skill, index: number) => (
                <Text key={`skill-${index}`} style={styles.skillItem}>
                  {`${skill.name}${skill.level ? ` (${skill.level})` : ""}`}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* --- Languages --- */}
        {languages.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>
              {template.language === "de" ? "Sprachen" : "Languages"}
            </Text>
            <View style={styles.skillsList}>
              {languages.map((lang: Language, index: number) => (
                <Text key={`lang-${index}`} style={styles.languageItem}>
                  {`${lang.name} (${lang.level})`}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* TODO: Add unimportant positions, school etc */}
      </Page>
    </Document>
  );
};
export default CVPdfDocument;
