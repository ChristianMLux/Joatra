"use client";

import { CircularProgress, Typography, Box } from "@mui/material";
import { LoadingSpinnerProps } from "@/lib/types";

export default function MuiLoadingSpinner({
  message = "Wird geladen...",
}: LoadingSpinnerProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
      }}
    >
      <CircularProgress size={48} color="primary" sx={{ mb: 2 }} />
      <Typography color="text.secondary" variant="body1">
        {message}
      </Typography>
    </Box>
  );
}
