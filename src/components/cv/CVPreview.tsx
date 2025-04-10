"use client";

import { useRef, useState } from "react";
import { UserProfile, Job, CVTemplate } from "@/lib/types";
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
          fileName: `CV_${profile.personalDetails.firstName}_${profile.personalDetails.lastName}_${job ? job.company.replace(/[^a-z0-9]/gi, "_") : "allgemein"}`, // Sanitize company name
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

  const keywords = Array.isArray(content.keywords)
    ? content.keywords.map((kw: string) => String(kw).toLowerCase())
    : [];

  const fontFamily =
    template.type === "standard"
      ? "'Times New Roman', Times, serif"
      : "'Arial', Helvetica, sans-serif";

  return (
    <Box>
      <Box className="mb-4 flex justify-end gap-2">
        <MuiButton
          variant="outline"
          startIcon={<EditIcon />}
          href={profile.id ? `/profile/edit` : `/profile/create`}
        >
          Profil bearbeiten
        </MuiButton>
        <MuiButton
          id="cv-download-button"
          variant="primary"
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

      <Paper
        elevation={0}
        ref={cvRef}
        className="border border-gray-200 rounded-lg max-w-4xl mx-auto bg-white"
        sx={{
          padding: "20mm 15mm",
          fontFamily: fontFamily,
          fontSize: "11pt",
          lineHeight: 1.4,
          color: "#333333",

          "& *": {
            fontFamily: fontFamily,
          },
          "& h1, & h2, & h3, & h4, & h5, & h6": {
            fontFamily: "'Arial', Helvetica, sans-serif",
            fontWeight: "bold",
            color: "#111111",
            marginTop: "0.8em",
            marginBottom: "0.4em",
          },
          "& h1": {
            // Name
            fontSize: "20pt",
            textAlign: "center",
            color: (theme) => theme.palette.primary.main,
            margin: "0 0 5mm 0",
            borderBottom: "1px solid",
            borderColor: (theme) => theme.palette.primary.light,
            paddingBottom: "3mm",
          },
          "& h2": {
            // Section Titles
            fontSize: "14pt",
            color: (theme) => theme.palette.primary.dark,
            borderBottom: "1px solid #cccccc",
            paddingBottom: "1mm",
            marginTop: "8mm",
            marginBottom: "4mm",
          },
          "& h3": {
            // Job Title / Degree
            fontSize: "12pt",
            fontWeight: "bold",
            color: "#000000",
            margin: "0 0 1mm 0",
          },
          "& p, & li": {
            color: "#333333",
            fontSize: "11pt",
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
            // Make strong tags actually bold
            fontWeight: "bold",
          },
          "& ul": {
            // Style bullet points
            paddingLeft: "5mm",
            listStyle: "disc",
            marginTop: "2mm",
            marginBottom: "2mm",
          },
          ".cv-section": {
            marginBottom: "8mm",
          },
          ".cv-item": {
            marginBottom: "5mm",
            paddingLeft: "5mm",
            borderLeft: "2px solid #eeeeee",
            paddingBottom: "2mm",
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
            fontSize: "10pt",
            color: "#555555",
            textAlign: "right",
            minWidth: "30mm",
            flexShrink: 0,
            paddingTop: "1pt",
          },
          ".contact-info": {
            textAlign: "center",
            fontSize: "10pt",
            color: "#444444",
            marginBottom: "5mm",
            borderBottom: "1px solid #eeeeee",
            paddingBottom: "3mm",
            "& span": {
              "&:not(:last-child)::after": {
                content: '" • "',
                margin: "0 0.5em",
              },
            },
          },
          ".skills-list, .languages-list": {
            fontSize: "11pt",
            paddingLeft: "5mm",
          },
          ".skills-list span, .languages-list span": {
            "&:not(:last-child)::after": {
              content: '", "',
            },
          },
        }}
      >
        {/* Name Header */}
        <h1>
          {profile.personalDetails.firstName} {profile.personalDetails.lastName}
        </h1>

        {/* Contact Info */}
        <Box className="contact-info">
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
          {/* TODO: Add Xing, GitHub etc. similarly if available */}
        </Box>

        {/* Summary */}
        {content.summary && (
          <Box className="cv-section">
            <Typography
              variant="body1"
              sx={{ fontStyle: "italic", color: "#444" }}
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
              <Box key={index} className="cv-item">
                <Box className="cv-item-header">
                  <Box className="cv-item-details">
                    <h3>{exp.position}</h3>
                    <Typography
                      variant="body1"
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
                    sx={{ whiteSpace: "pre-line", marginTop: "2mm" }}
                  >
                    {/* TODO: Consider parsing description into bullet points if possible */}
                    {exp.description}
                  </Typography>
                )}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul style={{ paddingLeft: "5mm", marginTop: "2mm" }}>
                    {exp.highlights.map((h: string, i: number) => (
                      <li key={i}>
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
              <Box key={index} className="cv-item">
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
                    sx={{ whiteSpace: "pre-line", marginTop: "2mm" }}
                  >
                    {edu.description}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Skills */}
        {content.skills?.length > 0 && (
          <Box className="cv-section">
            <h2>
              {template.language === "de"
                ? "Kenntnisse & Fähigkeiten"
                : "Skills"}
            </h2>
            <Typography variant="body1" className="skills-list">
              {content.skills.map((skill: any, index: number) => (
                <span key={index}>
                  {skill.name}
                  {skill.level ? ` (${skill.level})` : ""}
                </span>
              ))}
            </Typography>
            {/* TODO: Consider grouping skills by category here if data supports it */}
          </Box>
        )}

        {/* Languages */}
        {content.languages?.length > 0 && (
          <Box className="cv-section">
            <h2>{template.language === "de" ? "Sprachen" : "Languages"}</h2>
            <Typography variant="body1" className="languages-list">
              {content.languages.map((lang: any, index: number) => (
                <span key={index}>
                  {lang.name} ({lang.level})
                </span>
              ))}
            </Typography>
          </Box>
        )}

        {/* Interests (optional) */}
        {content.interests && content.interests.length > 0 && (
          <Box className="cv-section">
            <h2>{template.language === "de" ? "Interessen" : "Interests"}</h2>
            <Typography variant="body1">
              {content.interests.join(", ")}
            </Typography>
          </Box>
        )}

        {/* Add other sections like Certificates if they exist in content */}
      </Paper>
    </Box>
  );
}
