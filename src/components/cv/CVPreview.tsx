"use client";

import { useRef, useState } from "react";
import { UserProfile, Job, CVTemplate, Skill } from "@/lib/types";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import MuiButton from "@/components/ui/Button";
import { exportCVToPDF } from "@/lib/cv/cvExport";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CVPreviewProps {
  content: any;
  template: CVTemplate;
  profile: UserProfile;
  job?: Job | null;
}

const groupSkillsByCategory = (skills: Skill[]): Record<string, Skill[]> => {
  return skills.reduce(
    (acc, skill) => {
      const category = skill.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>
  );
};

export default function CVPreview({
  content,
  template,
  profile,
  job,
}: CVPreviewProps) {
  const cvRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const formatDateRange = (
    startDate: any,
    endDate: any,
    ongoing: boolean
  ): string => {
    const start = formatDatePart(startDate);
    const end = ongoing
      ? template.language === "de"
        ? "Heute"
        : "Present"
      : formatDatePart(endDate);

    if (!start && !end) return "";
    if (start && !end) return start;
    if (!start && end) return end;
    return `${start} - ${end}`;
  };

  const formatDatePart = (date: any): string => {
    if (!date) return "";
    let dateObj: Date;
    if (typeof date === "object" && "toDate" in date) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date(date);
    }
    if (isNaN(dateObj.getTime())) return "";
    return format(dateObj, "MM/yyyy", {
      locale: template.language === "de" ? de : undefined,
    });
  };

  const handleDownload = async () => {
    if (cvRef.current && !isDownloading) {
      setIsDownloading(true);
      try {
        await exportCVToPDF({
          element: cvRef.current,
          fileName: `CV_${profile.personalDetails.firstName}_${profile.personalDetails.lastName}_${job ? job.company.replace(/[^a-z0-9]/gi, "_") : "allgemein"}`,
          template: template,
        });
      } catch (error) {
        console.error("Download failed in CVPreview:", error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  if (!content) {
    return (
      <Box className="p-8 text-center border rounded-lg bg-gray-50">
        <Typography variant="body1" color="textSecondary">
          Lebenslauf konnte nicht generiert werden. Bitte versuche es erneut.
        </Typography>
      </Box>
    );
  }

  const groupedSkills = groupSkillsByCategory(content.skills || []);
  const skillCategories = Object.keys(groupedSkills);

  const fontFamily =
    template.type === "standard"
      ? "'Times New Roman', Times, serif"
      : "'Arial', Helvetica, sans-serif";

  return (
    <Box>
      {/* Action Buttons */}
      <Box className="mb-4 flex justify-end gap-2">
        <MuiButton
          variant="outline"
          size="sm"
          startIcon={<EditIcon />}
          href={profile.id ? `/profile/edit` : `/profile/create`}
        >
          Profil bearbeiten
        </MuiButton>
        <MuiButton
          id="cv-download-button"
          variant="primary"
          size="sm"
          startIcon={
            isDownloading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <DownloadIcon />
            )
          }
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? "Wird erstellt..." : "Als PDF herunterladen"}
        </MuiButton>
      </Box>

      {/* CV Paper */}
      <Paper
        elevation={0}
        ref={cvRef}
        className="border border-gray-200 rounded-lg max-w-4xl mx-auto bg-white"
        sx={{
          padding: "10mm 15mm 10mm 15mm",
          fontFamily: fontFamily,
          fontSize: "10pt",
          lineHeight: 1.3,
          color: "#333333",
          width: "210mm",
          minHeight: "297mm",
          boxSizing: "border-box",
          borderColor: "#AAAAAA",

          // --- Base Styles ---
          "& *": {
            fontFamily: fontFamily,
            boxSizing: "border-box",
          },
          "& h1, & h2, & h3, & h4, & h5, & h6": {
            fontFamily: "'Arial', Helvetica, sans-serif",
            fontWeight: "bold",
            color: "#111111",
            marginTop: "0.7em",
            marginBottom: "0.3em",
          },
          "& h1": {
            // Name
            fontSize: "18pt",
            textAlign: "center",
            color: (theme) => theme.palette.primary.main,
            margin: "0 0 4mm 0",
            borderBottom: "1px solid",
            borderColor: (theme) => theme.palette.primary.light,
            paddingBottom: "2.5mm",
          },
          "& h2": {
            // Section Titles
            fontSize: "13pt",
            color: (theme) => theme.palette.primary.dark,
            borderBottom: "1px solid #cccccc",
            paddingBottom: "1mm",
            marginTop: "6mm",
            marginBottom: "3mm",
          },
          "& h3": {
            // Job Title / Degree
            fontSize: "11.5pt",
            fontWeight: "bold",
            color: "#000000",
            margin: "0 0 1mm 0",
          },
          "& p, & li": {
            color: "#333333",
            fontSize: "10pt",
            marginBottom: "1mm",
          },
          "& a": {
            color: (theme) => theme.palette.primary.main,
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
            },
          },
          "& strong": {
            fontWeight: "bold",
          },
          "& ul": {
            // Bullet points for experience highlights
            paddingLeft: "5mm",
            listStyle: "disc",
            marginTop: "1.5mm",
            marginBottom: "1.5mm",
          },
          // --- Section & Item Styling ---
          ".cv-section": {
            marginBottom: "6mm",
          },
          ".cv-item": {
            marginBottom: "1mm",
            paddingLeft: "5mm",
            borderLeft: "2px solid #eeeeee",
            paddingBottom: "1.5mm",
          },
          ".cv-item-header": {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1mm",
          },
          ".cv-item-details": {
            flexGrow: 1,
            paddingRight: "5mm",
          },
          ".cv-date": {
            fontSize: "9.5pt",
            color: "#555555",
            textAlign: "right",
            minWidth: "28mm",
            flexShrink: 0,
            paddingTop: "1pt",
          },
          // --- Specific Sections ---
          ".contact-info": {
            textAlign: "center",
            fontSize: "9.5pt",
            color: "#444444",
            marginBottom: "4mm",
            borderBottom: "1px solid #eeeeee",
            paddingBottom: "2.5mm",
            "& span": {
              "&:not(:last-child)::after": {
                content: '" • "',
                margin: "0 0.5em",
              },
            },
          },
          ".skills-list, .languages-list, .interests-list": {
            // Added interests-list
            fontSize: "10.5pt",
            paddingLeft: "5mm",
            marginTop: "1mm",
          },
          ".skills-list span, .languages-list span": {
            "&:not(:last-child)::after": {
              content: '", "',
            },
          },
          ".skill-category-title": {
            // Styling for category subheadings
            fontSize: "10.5pt",
            fontWeight: "bold",
            color: "#444444",
            marginTop: "2mm",
            marginBottom: "0.5mm",
            paddingLeft: "5mm",
          },
        }}
      >
        {/* Name Header */}
        <h1>
          {profile.personalDetails.firstName} {profile.personalDetails.lastName}
        </h1>

        {/* Contact Info */}
        <Box className="contact-info">
          {/* ... contact info rendering ... */}
          {profile.personalDetails.email && (
            <Typography variant="body2" component="span">
              {profile.personalDetails.email}
            </Typography>
          )}
          {profile.personalDetails.phone && (
            <Typography variant="body2" component="span">
              {profile.personalDetails.phone}
            </Typography>
          )}
          {profile.personalDetails.address && (
            <Typography variant="body2" component="span">
              {`${profile.personalDetails.address}${profile.personalDetails.postalCode || profile.personalDetails.city ? ", " : ""}${profile.personalDetails.postalCode || ""} ${profile.personalDetails.city || ""}`}
            </Typography>
          )}
          {profile.personalDetails.website && (
            <Typography variant="body2" component="span">
              <a
                href={profile.personalDetails.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {profile.personalDetails.website}
              </a>
            </Typography>
          )}
          {profile.personalDetails.linkedin && (
            <Typography variant="body2" component="span">
              <a
                href={profile.personalDetails.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </Typography>
          )}
        </Box>

        {/* Summary */}
        {content.summary && (
          <Box className="cv-section">
            <Typography
              variant="body1"
              sx={{ fontStyle: "italic", color: "#444", fontSize: "8px" }}
            >
              {content.summary}
            </Typography>
          </Box>
        )}

        {/* Professional Experience */}
        {content.experience?.length > 0 && (
          <Box className="cv-section">
            <h2>
              {template.language === "de"
                ? "Berufserfahrung"
                : "Professional Experience"}
            </h2>
            {content.experience.map((exp: any, index: number) => (
              <Box key={`exp-${index}`} className="cv-item">
                <Box className="cv-item-header">
                  <Box className="cv-item-details">
                    <h3>{exp.position}</h3>
                    <Typography
                      variant="body1"
                      padding=""
                      sx={{ fontWeight: "500", color: "#222" }}
                    >
                      {exp.company} {exp.location && `| ${exp.location}`}
                    </Typography>
                  </Box>
                  <Typography variant="body2" className="cv-date">
                    {formatDateRange(exp.startDate, exp.endDate, exp.ongoing)}
                  </Typography>
                </Box>
                {exp.description && (
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-line", marginTop: "1.5mm" }}
                  >
                    {/* Render the potentially tailored description */}
                    {exp.description}
                  </Typography>
                )}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul style={{ paddingLeft: "5mm", marginTop: "1.5mm" }}>
                    {exp.highlights.map((h: string, i: number) => (
                      <li key={`highlight-${i}`}>
                        <Typography variant="body2">{h}</Typography>
                      </li>
                    ))}
                  </ul>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Education */}
        {content.education?.length > 0 && (
          <Box className="cv-section">
            <h2>{template.language === "de" ? "Ausbildung" : "Education"}</h2>
            {content.education.map((edu: any, index: number) => (
              <Box key={`edu-${index}`} className="cv-item">
                <Box className="cv-item-header">
                  <Box className="cv-item-details">
                    <h3>
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </h3>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "500", color: "#222" }}
                    >
                      {edu.institution} {edu.location && `| ${edu.location}`}
                    </Typography>
                  </Box>
                  <Typography variant="body2" className="cv-date">
                    {formatDateRange(edu.startDate, edu.endDate, edu.ongoing)}
                  </Typography>
                </Box>
                {edu.description && (
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-line", marginTop: "1.5mm" }}
                  >
                    {edu.description}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Skills - Grouped by Category */}
        {skillCategories.length > 0 && (
          <Box className="cv-section">
            <h2>
              {template.language === "de"
                ? "Kenntnisse & Fähigkeiten"
                : "Skills"}
            </h2>
            {skillCategories.map((category) => (
              <Box key={category} mb={1}>
                {" "}
                <Typography className="skill-category-title">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
                <Typography variant="body1" className="skills-list">
                  {groupedSkills[category].map((skill: any, index: number) => (
                    <span key={`${category}-skill-${index}`}>
                      {skill.name}
                      {skill.level ? ` (${skill.level})` : ""}
                    </span>
                  ))}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Languages */}
        {content.languages?.length > 0 && (
          <Box className="cv-section">
            <h2>{template.language === "de" ? "Sprachen" : "Languages"}</h2>
            <Typography variant="body1" className="languages-list">
              {content.languages.map((lang: any, index: number) => (
                <span key={`lang-${index}`}>
                  {lang.name} ({lang.level})
                </span>
              ))}
            </Typography>
          </Box>
        )}

        {/* Interests */}
        {content.interests && content.interests.length > 0 && (
          <Box className="cv-section">
            <h2>{template.language === "de" ? "Interessen" : "Interests"}</h2>
            <Typography variant="body1" className="interests-list">
              {content.interests.join(", ")}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
