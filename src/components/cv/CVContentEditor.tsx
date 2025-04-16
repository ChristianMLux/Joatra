import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import MuiButton from "@/components/ui/Button";
import CloseIcon from "@mui/icons-material/Close";
import { useCVGenerator } from "@/providers/CVGeneratorProvider";
import { Experience, Education } from "@/lib/types";

export default function CVContentEditor() {
  const { isEditing, setIsEditing, generatedContent, updateGeneratedContent } =
    useCVGenerator();
  const [localContent, setLocalContent] = useState<any>(null);

  useEffect(() => {
    if (isEditing && generatedContent) {
      setLocalContent(JSON.parse(JSON.stringify(generatedContent)));
    } else {
      setLocalContent(null);
    }
  }, [isEditing, generatedContent]);

  const handleClose = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    if (localContent) {
      updateGeneratedContent(localContent);
    }
  };

  const handleSummaryChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setLocalContent((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExperienceChange = (
    index: number,
    field: keyof Experience,
    value: string
  ) => {
    setLocalContent((prev: any) => {
      if (!prev || !Array.isArray(prev.experience)) return prev;

      const updatedExperience = prev.experience.map(
        (exp: Experience, i: number) => {
          if (i === index) {
            return { ...exp, [field]: value };
          }
          return exp;
        }
      );
      return { ...prev, experience: updatedExperience };
    });
  };

  const handleEducationChange = (
    index: number,
    field: keyof Education,
    value: string
  ) => {
    setLocalContent((prev: any) => {
      if (!prev || !Array.isArray(prev.education)) return prev;

      const updatedEducation = prev.education.map(
        (edu: Education, i: number) => {
          if (i === index) {
            return { ...edu, [field]: value };
          }
          return edu;
        }
      );
      return { ...prev, education: updatedEducation };
    });
  };

  if (!isEditing || !localContent) {
    return null;
  }

  return (
    <Dialog
      open={isEditing}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { height: "90vh" } }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Lebenslauf bearbeiten
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {" "}
        {/* Summary Section */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Zusammenfassung
          </Typography>
          <TextField
            name="summary"
            value={localContent.summary || ""}
            onChange={handleSummaryChange}
            multiline
            minRows={4}
            fullWidth
            variant="outlined"
          />
        </Box>
        <Divider sx={{ my: 3 }} />
        {/* Experience Section */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Berufserfahrung
          </Typography>
          {localContent.experience?.map((exp: Experience, index: number) => (
            <Box
              key={`exp-edit-${index}`}
              mb={3}
              pl={1}
              borderLeft={2}
              borderColor="divider"
            >
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: "medium", ml: 1 }}
              >
                {exp.position} bei {exp.company}
              </Typography>
              <TextField
                label="Beschreibung"
                value={exp.description || ""}
                onChange={(e) =>
                  handleExperienceChange(index, "description", e.target.value)
                }
                multiline
                minRows={3}
                fullWidth
                variant="outlined"
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
          ))}
        </Box>
        <Divider sx={{ my: 3 }} />
        {/* Education Section */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Ausbildung
          </Typography>
          {localContent.education?.map((edu: Education, index: number) => (
            <Box
              key={`edu-edit-${index}`}
              mb={3}
              pl={1}
              borderLeft={2}
              borderColor="divider"
            >
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontWeight: "medium", ml: 1 }}
              >
                {edu.degree} - {edu.institution}
              </Typography>
              <TextField
                label="Beschreibung"
                value={edu.description || ""}
                onChange={(e) =>
                  handleEducationChange(index, "description", e.target.value)
                }
                multiline
                minRows={2}
                fullWidth
                variant="outlined"
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <MuiButton onClick={handleClose} variant="outline">
          Abbrechen
        </MuiButton>
        <MuiButton onClick={handleSave} variant="primary">
          Änderungen speichern
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
}
