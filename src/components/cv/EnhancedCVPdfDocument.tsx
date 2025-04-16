import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link as PdfLink,
  Image,
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

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#333333",
  },
  // --- Header Section ---
  headerSection: {
    backgroundColor: "#0077B6",
    color: "#FFFFFF",
    padding: "10mm 15mm",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  headerName: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 11,
    marginBottom: 8,
    color: "#FFFFFF",
  },
  headerContact: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    fontSize: 9,
  },
  contactText: {
    marginLeft: 4,
    color: "#FFFFFF",
  },
  contactLink: {
    marginLeft: 4,
    color: "#FFFFFF",
    textDecoration: "none",
  },
  headerRight: {
    marginLeft: 15,
  },
  initialsCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#005A8D",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },
  // --- Body Section ---
  bodySection: {
    flexDirection: "row",
    flexGrow: 1,
    padding: "10mm 15mm",
  },
  // --- Left Column  ---
  leftColumn: {
    width: "65%",
    paddingRight: "8mm",
  },
  // --- Right Column  ---
  rightColumn: {
    width: "35%",
    paddingLeft: "8mm",
    borderLeftWidth: 1,
    borderLeftColor: "#e0e0e0",
  },
  // --- General Section Styling ---
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#0077B6",
    marginBottom: 8,
    textTransform: "uppercase",
    borderBottomWidth: 1.5,
    borderBottomColor: "#0077B6",
    paddingBottom: 2,
  },
  // --- Experience & Education Item Styling ---
  item: {
    marginBottom: 10,
  },
  itemHeader: {
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#111111",
  },
  itemSubtitle: {
    fontSize: 9.5,
    color: "#555555",
    marginBottom: 3,
  },
  itemDate: {
    fontSize: 8.5,
    color: "#777777",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 9,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bullet: {
    width: 5,
    fontSize: 9,
    marginRight: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
  },
  summaryText: {
    fontSize: 9,
    textAlign: "justify",
  },
  languageItem: {
    marginBottom: 6,
  },
  languageName: {
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  languageLevelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    marginRight: 3,
  },
  languageDotFilled: {
    backgroundColor: "#0077B6",
  },
  languageLevelText: {
    fontSize: 8,
    color: "#666",
    marginLeft: 5,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillTag: {
    fontSize: 8.5,
    backgroundColor: "#f0f0f0",
    color: "#444444",
    padding: "3px 6px",
    marginRight: 4,
    marginBottom: 4,
    borderRadius: 3,
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

const renderLanguageLevel = (level: Language["level"]) => {
  const levels: Record<Language["level"], number> = {
    Muttersprache: 5,
    C2: 5,
    C1: 4,
    B2: 3,
    B1: 2,
    A2: 1,
    A1: 0,
  };
  const filledDots = levels[level] ?? 0;
  const totalDots = 5;
  const dots = [];
  for (let i = 0; i < totalDots; i++) {
    dots.push(
      <View
        key={i}
        style={[
          styles.languageDot,
          i < filledDots ? styles.languageDotFilled : {},
        ]}
      />
    );
  }
  return <View style={styles.languageLevelContainer}>{dots}</View>;
};

interface EnhancedCVPdfDocumentProps {
  profile: UserProfile;
  job?: Job | null;
  content: any;
  template: CVTemplate;
}

const EnhancedCVPdfDocument: React.FC<EnhancedCVPdfDocumentProps> = ({
  profile,
  job,
  content,
  template,
}) => {
  if (!profile || !content) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Error: Missing profile or content data.</Text>
        </Page>
      </Document>
    );
  }

  const initials =
    `${profile.personalDetails.firstName?.charAt(0) || ""}${profile.personalDetails.lastName?.charAt(0) || ""}`.toUpperCase();
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
        <View style={styles.headerSection} fixed>
          {" "}
          {/* Fixed header */}
          <View style={styles.headerLeft}>
            <Text
              style={styles.headerName}
            >{`${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`}</Text>
            <Text style={styles.headerTitle}>
              {job?.jobTitle || "Full-Stack Softwareentwickler"}
            </Text>{" "}
            {/* Fallback title */}
            {/* Contact Info */}
            {profile.personalDetails.phone && (
              <View style={styles.headerContact}>
                <Text>📞</Text>
                <Text style={styles.contactText}>
                  {profile.personalDetails.phone}
                </Text>
              </View>
            )}
            {profile.personalDetails.email && (
              <View style={styles.headerContact}>
                <Text>📧</Text>
                <Text style={styles.contactText}>
                  {profile.personalDetails.email}
                </Text>
              </View>
            )}
            {profile.personalDetails.address && (
              <View style={styles.headerContact}>
                <Text>📍</Text>
                <Text
                  style={styles.contactText}
                >{`${profile.personalDetails.address}, ${profile.personalDetails.postalCode || ""} ${profile.personalDetails.city || ""}`}</Text>
              </View>
            )}
            {/* Add Links if needed */}
          </View>
          <View style={styles.headerRight}>
            <View style={styles.initialsCircle}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          </View>
        </View>

        {/* --- Body --- */}
        <View style={styles.bodySection}>
          {/* --- Left Column --- */}
          <View style={styles.leftColumn}>
            {/* Experience */}
            {experience.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ERFAHRUNG</Text>
                {experience.map((exp: Experience, index: number) => (
                  <View key={`exp-${index}`} style={styles.item} wrap={false}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{exp.position}</Text>
                    </View>
                    <Text
                      style={styles.itemSubtitle}
                    >{`${exp.company}${exp.location ? ` | ${exp.location}` : ""}`}</Text>
                    <Text style={styles.itemDate}>
                      {formatDateRange(
                        exp.startDate,
                        exp.endDate,
                        exp.ongoing,
                        template.language
                      )}
                    </Text>
                    {exp.description &&
                      exp.description.split("\n").map((line, i) =>
                        line.trim() ? (
                          <View key={`desc-${i}`} style={styles.bulletPoint}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>{line.trim()}</Text>
                          </View>
                        ) : null
                      )}
                  </View>
                ))}
              </View>
            )}

            {/* Education */}
            {education.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>AUSBILDUNG</Text>
                {education.map((edu: Education, index: number) => (
                  <View key={`edu-${index}`} style={styles.item} wrap={false}>
                    <View style={styles.itemHeader}>
                      <Text
                        style={styles.itemTitle}
                      >{`${edu.degree}${edu.field ? ` in ${edu.field}` : ""}`}</Text>
                    </View>
                    <Text
                      style={styles.itemSubtitle}
                    >{`${edu.institution}${edu.location ? ` | ${edu.location}` : ""}`}</Text>
                    <Text style={styles.itemDate}>
                      {formatDateRange(
                        edu.startDate,
                        edu.endDate,
                        edu.ongoing,
                        template.language
                      )}
                    </Text>
                    {edu.description &&
                      edu.description.split("\n").map((line, i) =>
                        line.trim() ? (
                          <View
                            key={`desc-edu-${i}`}
                            style={styles.bulletPoint}
                          >
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>{line.trim()}</Text>
                          </View>
                        ) : null
                      )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* --- Right Column --- */}
          <View style={styles.rightColumn}>
            {/* Summary */}
            {content.summary && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ZUSAMMENFASSUNG</Text>
                <Text style={styles.summaryText}>{content.summary}</Text>
              </View>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SPRACHEN</Text>
                {languages.map((lang: Language, index: number) => (
                  <View key={`lang-${index}`} style={styles.languageItem}>
                    <Text style={styles.languageName}>{lang.name}</Text>
                    {renderLanguageLevel(lang.level)}
                  </View>
                ))}
              </View>
            )}

            {skills.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>FÄHIGKEITEN</Text>
                <View style={styles.skillsContainer}>
                  {skills.map((skill: Skill, index: number) => (
                    <Text key={`skill-${index}`} style={styles.skillTag}>
                      {skill.name}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};
export default EnhancedCVPdfDocument;
