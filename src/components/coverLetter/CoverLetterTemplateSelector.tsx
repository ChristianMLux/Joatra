"use client";

import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Chip,
} from "@mui/material";

interface CoverLetterTemplate {
  id: string;
  name: string;
  description: string;
  language: "de" | "en";
  style: "formal" | "modern" | "creative";
  atsOptimized: boolean;
  din5008Compliant?: boolean;
}

interface CoverLetterTemplateSelectorProps {
  templates: CoverLetterTemplate[];
  selectedTemplateId?: string | null;
  onSelect: (template: CoverLetterTemplate) => void;
}

export default function CoverLetterTemplateSelector({
  templates,
  selectedTemplateId,
  onSelect,
}: CoverLetterTemplateSelectorProps) {
  const displayTemplates = templates || [];

  if (displayTemplates.length === 0) {
    return (
      <Box className="p-8 text-center border rounded-lg bg-gray-50 dark:bg-gray-800">
        <Typography variant="body1" color="textSecondary">
          Keine Templates verfügbar.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {displayTemplates.map((template) => (
        <Grid
          key={template.id}
          sx={{ width: { xs: "100%", sm: "50%", md: "33.33%", lg: "25%" } }}
        >
          <Card
            elevation={0}
            className={`border rounded-lg transition-all h-full flex flex-col ${selectedTemplateId === template.id ? "border-blue-500" : "border-gray-200 dark:border-gray-700"} hover:border-blue-400 dark:hover:border-blue-500`}
            sx={{
              boxShadow:
                selectedTemplateId === template.id
                  ? "0 0 0 2px rgba(59, 130, 246, 0.5)"
                  : "none",
            }}
          >
            <CardActionArea
              onClick={() => onSelect(template)}
              className="flex flex-col flex-grow"
            >
              <CardMedia
                component="img"
                sx={{
                  aspectRatio: "3/4",
                  backgroundColor: "grey.100",
                  objectFit: "contain",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  p: 1,
                }}
                image={`/assets/templates/cover-letter-${template.id}.png`}
                alt={template.name}
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src =
                    "/assets/templates/cover-letter-placeholder.png";
                }}
              />
              <CardContent className="p-4 flex flex-col flex-grow">
                <Box className="flex justify-between items-start mb-2">
                  <Typography
                    variant="h6"
                    component="h3"
                    className="text-base font-semibold"
                  >
                    {template.name}
                  </Typography>
                  <Chip
                    label={template.language === "de" ? "Deutsch" : "Englisch"}
                    size="small"
                    color={template.language === "de" ? "primary" : "secondary"}
                    variant="outlined"
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className="text-sm mb-3 flex-grow"
                >
                  {template.description}
                </Typography>
                <Box className="mt-auto flex flex-wrap gap-1 pt-2">
                  {template.atsOptimized && (
                    <Chip
                      label="ATS-optimiert"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                  {template.din5008Compliant && (
                    <Chip
                      label="DIN 5008"
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  )}
                  <Chip
                    label={
                      template.style.charAt(0).toUpperCase() +
                      template.style.slice(1)
                    }
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
