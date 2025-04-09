"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Chip, Box } from "@mui/material";

interface FilterTabProps {
  label: string;
  value: string;
  count?: number;
  isActive: boolean;
  onClick: (value: string) => void;
}

const FilterTab: React.FC<FilterTabProps> = ({
  label,
  value,
  count,
  isActive,
  onClick,
}) => {
  return (
    <Button
      variant={isActive ? "contained" : "outlined"}
      color={isActive ? "primary" : "secondary"}
      onClick={() => onClick(value)}
      fullWidth
      sx={{
        py: 1.5,
        borderRadius: 2,
        transform: isActive ? "scale(1.05)" : "scale(1)",
        transition: "transform 0.2s",
        justifyContent: "center",
        "&:hover": {
          transform: isActive ? "scale(1.05)" : "scale(1.02)",
        },
      }}
    >
      {label}
      {count !== undefined && (
        <Chip
          label={count}
          size="small"
          color={isActive ? "default" : "secondary"}
          sx={{
            ml: 1,
            backgroundColor: isActive ? "white" : "rgba(0, 0, 0, 0.08)",
            color: isActive ? "primary.main" : "text.secondary",
            fontWeight: "medium",
            fontSize: "0.75rem",
            height: "20px",
            minWidth: "20px",
          }}
        />
      )}
    </Button>
  );
};

interface MuiFilterTabsProps {
  statusCounts: Record<string, number>;
  totalCount: number;
}

export const MuiFilterTabs: React.FC<MuiFilterTabsProps> = ({
  statusCounts,
  totalCount,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "all";

  const handleFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }

    router.push(`/?${params.toString()}`);
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        <FilterTab
          label="Alle"
          value="all"
          count={totalCount}
          isActive={currentStatus === "all"}
          onClick={handleFilterChange}
        />
      </Box>
      <Box>
        <FilterTab
          label="Offen"
          value="Beworben"
          count={statusCounts["Beworben"] || 0}
          isActive={currentStatus === "Beworben"}
          onClick={handleFilterChange}
        />
      </Box>
      <Box>
        <FilterTab
          label="Abgelehnt"
          value="Abgelehnt"
          count={statusCounts["Abgelehnt"] || 0}
          isActive={currentStatus === "Abgelehnt"}
          onClick={handleFilterChange}
        />
      </Box>
      <Box>
        <FilterTab
          label="Angenommen"
          value="Angenommen"
          count={statusCounts["Angenommen"] || 0}
          isActive={currentStatus === "Angenommen"}
          onClick={handleFilterChange}
        />
      </Box>
    </Box>
  );
};

export default MuiFilterTabs;
