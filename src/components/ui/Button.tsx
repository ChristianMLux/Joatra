"use client";

import React from "react";
import {
  Button as MuiButtonBase,
  ButtonProps as MuiButtonProps,
  CircularProgress,
} from "@mui/material";

interface CustomButtonProps {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  isLoading?: boolean;
}

type ButtonProps = Omit<MuiButtonProps, "color" | "size" | "variant"> &
  CustomButtonProps;

export const MuiButton: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  isLoading = false,
  disabled,
  ...props
}) => {
  const getMuiProps = () => {
    switch (variant) {
      case "primary":
        return { variant: "contained" as const, color: "primary" as const };
      case "secondary":
        return { variant: "contained" as const, color: "secondary" as const };
      case "danger":
        return { variant: "contained" as const, color: "error" as const };
      case "success":
        return { variant: "contained" as const, color: "success" as const };
      case "outline":
        return { variant: "outlined" as const, color: "primary" as const };
      default:
        return { variant: "contained" as const, color: "primary" as const };
    }
  };

  const getMuiSize = () => {
    switch (size) {
      case "sm":
        return "small" as const;
      case "md":
        return "medium" as const;
      case "lg":
        return "large" as const;
      default:
        return "medium" as const;
    }
  };

  const { variant: muiVariant, color } = getMuiProps();
  const muiSize = getMuiSize();

  return (
    <MuiButtonBase
      color={color}
      variant={muiVariant}
      size={muiSize}
      fullWidth={fullWidth}
      disabled={disabled || isLoading}
      startIcon={isLoading ? undefined : icon}
      {...props}
    >
      {isLoading && (
        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
      )}
      {children}
    </MuiButtonBase>
  );
};

export default MuiButton;
