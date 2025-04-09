"use client";

import { Chip } from "@mui/material";
import { StatusBadgeProps } from "@/lib/types";

type ChipColorType =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

export default function MuiStatusBadge({ status }: StatusBadgeProps) {
  const getChipProps = (): { color: ChipColorType; label: string } => {
    switch (status) {
      case "Beworben":
        return { color: "warning", label: "Beworben" };
      case "Interview":
        return { color: "info", label: "Interview" };
      case "Abgelehnt":
        return { color: "error", label: "Abgelehnt" };
      case "Angenommen":
        return { color: "success", label: "Angenommen" };
      default:
        return { color: "default", label: status };
    }
  };

  const { color, label } = getChipProps();

  return (
    <Chip
      color={color}
      label={label}
      size="small"
      sx={{
        fontWeight: 500,
        borderRadius: "4px",
        height: "auto",
        padding: "4px 0",
      }}
    />
  );
}
