"use client";

import React from "react";
import {
  Button as MuiButtonBase,
  ButtonProps as MuiButtonProps, // Importiere die originalen Props für Referenz
  CircularProgress,
  SxProps, // Importiere SxProps für das sx Prop
  Theme, // Importiere Theme für SxProps
} from "@mui/material";

// Definiere die erlaubten Custom-Größen explizit
type CustomButtonSize = "sm" | "md" | "lg";

// Definiere die erlaubten Custom-Varianten
type CustomButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "outline";

// Definiere die Props für unseren Custom Button expliziter
interface ButtonProps {
  children?: React.ReactNode;
  variant?: CustomButtonVariant;
  size?: CustomButtonSize;
  icon?: React.ReactNode; // Behalte unser 'icon' Prop für Konsistenz oder nenne es startIcon
  isLoading?: boolean;
  // Übernehme häufig verwendete MUI Button Props explizit
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  fullWidth?: boolean;
  href?: string;
  type?: "button" | "submit" | "reset";
  sx?: SxProps<Theme>; // Erlaube das sx Prop
  className?: string; // Erlaube className
  // Füge weitere benötigte MuiButtonProps hier hinzu, falls nötig
  // z.B.: component, endIcon, etc.
  // ...rest kann entfernt werden, wenn alle Props explizit sind, oder beibehalten für Flexibilität
  [key: string]: any; // Erlaube beliebige weitere Props (optional, für Flexibilität)
}

export const MuiButton: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md", // Standardwert für unsere Custom Size
  fullWidth = false,
  icon, // Unser Prop
  isLoading = false,
  disabled,
  // Destrukturiere die explizit definierten Props
  onClick,
  href,
  type = "button", // Standard-Typ
  sx,
  className,
  ...rest // Fängt alle übrigen Props auf, die über [key: string]: any erlaubt sind
}) => {
  // Funktion zum Mappen unserer 'size' auf MUI 'size'
  const getMuiSize = (customSize: CustomButtonSize): MuiButtonProps["size"] => {
    switch (customSize) {
      case "sm":
        return "small";
      case "md":
        return "medium";
      case "lg":
        return "large";
      default:
        return "medium";
    }
  };

  // Funktion zum Mappen unserer 'variant' auf MUI 'variant' und 'color'
  const getMuiVariantAndColor = (
    customVariant: CustomButtonVariant | undefined
  ): { variant: MuiButtonProps["variant"]; color: MuiButtonProps["color"] } => {
    switch (customVariant) {
      case "primary":
        return { variant: "contained", color: "primary" };
      case "secondary":
        return { variant: "contained", color: "secondary" };
      case "danger":
        return { variant: "contained", color: "error" };
      case "success":
        return { variant: "contained", color: "success" };
      case "outline":
        return { variant: "outlined", color: "primary" };
      default:
        return { variant: "contained", color: "primary" };
    }
  };

  const { variant: muiVariant, color: muiColor } =
    getMuiVariantAndColor(variant);
  const muiSize = getMuiSize(size);

  return (
    <MuiButtonBase
      // Übergib die gemappten und expliziten Props
      color={muiColor}
      variant={muiVariant}
      size={muiSize}
      fullWidth={fullWidth}
      disabled={disabled || isLoading}
      onClick={onClick}
      href={href}
      type={type}
      sx={sx}
      className={className}
      // StartIcon nur setzen, wenn nicht geladen wird und icon vorhanden ist
      startIcon={!isLoading && icon ? icon : undefined}
      {...rest} // Übergib die restlichen Props
    >
      {/* Ladeanzeige, wenn isLoading true ist */}
      {isLoading && (
        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
      )}
      {children}
    </MuiButtonBase>
  );
};

export default MuiButton;
