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
  Alert,
} from "@mui/material";
import MuiButton from "@/components/ui/Button";
import CloseIcon from "@mui/icons-material/Close";
import { useCoverLetterGenerator } from "@/providers/CoverLetterGeneratorProvider";

export default function CoverLetterContentEditor() {
  const { isEditing, setIsEditing, generatedContent, updateGeneratedContent } =
    useCoverLetterGenerator();

  const [localContent, setLocalContent] = useState<any>(null);

  useEffect(() => {
    if (isEditing && generatedContent) {
      console.log(
        "CL_EDITOR: Initializing localContent with:",
        generatedContent
      );
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
      console.log("CL_EDITOR: Saving localContent:", localContent);
      updateGeneratedContent(localContent);
    }
  };

  const handleLocalChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setLocalContent((prev: any) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: value,
      };
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
        Anschreiben bearbeiten
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {" "}
        {/* Add dividers and padding */}
        <Alert severity="warning" sx={{ mb: 3 }}>
          Hinweis: Änderungen hier überschreiben die automatisch generierten
          oder zuvor gespeicherten Texte. Die Adressblöcke sind derzeit nicht
          bearbeitbar.
        </Alert>
        {/* Subject Section */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Betreff
          </Typography>
          <TextField
            name="subject"
            label="Betreffzeile"
            value={localContent.subject || ""}
            onChange={handleLocalChange}
            fullWidth
            variant="outlined"
            size="small"
          />
        </Box>
        {/* Salutation Section */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Anrede
          </Typography>
          <TextField
            name="salutation"
            label="Anrede"
            value={localContent.salutation || ""}
            onChange={handleLocalChange}
            fullWidth
            variant="outlined"
            size="small"
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        {/* Introduction Section */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Einleitung
          </Typography>
          <TextField
            name="introduction"
            label="Einleitungstext"
            value={localContent.introduction || ""}
            onChange={handleLocalChange}
            multiline
            minRows={3}
            fullWidth
            variant="outlined"
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        {/* Main Body Section */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Hauptteil
          </Typography>
          <TextField
            name="mainBody"
            label="Haupttext (Absätze durch Leerzeilen trennen)"
            value={localContent.mainBody || ""}
            onChange={handleLocalChange}
            multiline
            minRows={6}
            fullWidth
            variant="outlined"
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        {/* Closing Section */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Schluss
          </Typography>
          <TextField
            name="closing"
            label="Schlusstext (inkl. Grußformel und Name)"
            value={localContent.closing || ""}
            onChange={handleLocalChange}
            multiline
            minRows={3}
            fullWidth
            variant="outlined"
          />
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
