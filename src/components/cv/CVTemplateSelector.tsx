"use client";

import { CVTemplate } from "@/lib/types";
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

interface CVTemplateSelectorProps {
  templates: CVTemplate[];
  selectedTemplateId?: string;
  onSelect: (template: CVTemplate) => void;
}

export default function CVTemplateSelector({
  templates,
  selectedTemplateId,
  onSelect,
}: CVTemplateSelectorProps) {
  const displayTemplates = templates;

  if (displayTemplates.length === 0) {
    return (
      <Box className="p-8 text-center border rounded-lg bg-gray-50">
        <Typography variant="body1" color="textSecondary">
          Keine Templates verfügbar.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {displayTemplates.map((template) => (
        <Grid key={template.id}>
          <Card
            elevation={0}
            className={`border ${selectedTemplateId === template.id ? "border-blue-500" : "border-gray-200"} rounded-lg transition-all`}
            sx={{
              boxShadow:
                selectedTemplateId === template.id
                  ? "0 0 0 2px rgba(59, 130, 246, 0.5)"
                  : "none",
              "&:hover": {
                borderColor:
                  selectedTemplateId === template.id
                    ? "rgb(59, 130, 246)"
                    : "rgb(209, 213, 219)",
              },
            }}
          >
            <CardActionArea onClick={() => onSelect(template)}>
              <CardMedia
                component="img"
                height="180"
                image={`/assets/templates/${template.id}.png`}
                alt={template.name}
                sx={{
                  backgroundColor: "gray.100",
                  objectFit: "contain",
                }}
                onError={(e: any) => {
                  e.target.src = "/assets/templates/template-placeholder.png";
                }}
              />
              <CardContent className="p-5">
                <Box className="flex justify-between items-start mb-2">
                  <Typography variant="h6" component="h3">
                    {template.name}
                  </Typography>
                  <Chip
                    label={template.language === "de" ? "Deutsch" : "Englisch"}
                    size="small"
                    color={template.language === "de" ? "primary" : "secondary"}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {template.description}
                </Typography>
                <Box className="mt-3 flex flex-wrap gap-1">
                  {template.atsOptimized && (
                    <Chip label="ATS-optimiert" size="small" color="success" />
                  )}
                  <Chip
                    label={template.photoIncluded ? "Mit Foto" : "Ohne Foto"}
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
