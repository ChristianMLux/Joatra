"use client";

import { createTheme } from "@mui/material/styles";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const customShadows = {
  card: "0px 2px 4px -1px rgba(0,0,0,0.06), 0px 4px 6px -1px rgba(0,0,0,0.1)",
  cardHover:
    "0px 6px 10px -2px rgba(0,0,0,0.1), 0px 4px 6px -1px rgba(0,0,0,0.05)",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
      light: "#3b82f6",
      dark: "#1d4ed8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#6b7280",
      light: "#9ca3af",
      dark: "#4b5563",
      contrastText: "#ffffff",
    },
    error: {
      main: "#dc2626",
      light: "#ef4444",
      dark: "#b91c1c",
    },
    success: {
      main: "#16a34a",
      light: "#22c55e",
      dark: "#166534",
    },
    warning: {
      main: "#d97706",
      light: "#f59e0b",
      dark: "#92400e",
    },
    info: {
      main: "#0284c7",
      light: "#0ea5e9",
      dark: "#0369a1",
    },
    background: {
      default: "#f7fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a202c",
      secondary: "#4b5563",
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    h1: {
      fontSize: "1.875rem",
      fontWeight: 700,
      marginBottom: "1.5rem",
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 700,
      marginBottom: "1rem",
    },
    h3: {
      fontSize: "1.25rem",
      fontWeight: 700,
      marginBottom: "0.5rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: customShadows.card,
          borderRadius: 8,
          overflow: "hidden",
          border: "none",
          transition: "box-shadow 0.3s ease-in-out",
          "&:hover": {
            boxShadow: customShadows.cardHover,
          },
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        sizeMedium: {
          padding: "0.5rem 1rem",
        },
        sizeSmall: {
          padding: "0.25rem 0.75rem",
        },
        contained: {
          "&:hover": {
            backgroundColor: "#1d4ed8",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: customShadows.card,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "0.375rem",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
