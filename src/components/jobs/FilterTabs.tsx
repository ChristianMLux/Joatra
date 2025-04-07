"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
    <button
      className={`
        flex items-center justify-center flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all
        ${
          isActive
            ? "bg-blue-600 text-white shadow-md transform scale-105"
            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
        }
      `}
      onClick={() => onClick(value)}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`ml-2 px-2 py-0.5 text-xs rounded-full ${isActive ? "bg-white text-blue-600" : "bg-gray-100 text-gray-600"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
};

interface FilterTabsProps {
  statusCounts: Record<string, number>;
  totalCount: number;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
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
    <div className="grid grid-cols-4 gap-4 mb-6">
      <FilterTab
        label="Alle"
        value="all"
        count={totalCount}
        isActive={currentStatus === "all"}
        onClick={handleFilterChange}
      />
      <FilterTab
        label="Offen"
        value="Beworben"
        count={statusCounts["Beworben"] || 0}
        isActive={currentStatus === "Beworben"}
        onClick={handleFilterChange}
      />
      <FilterTab
        label="Abgelehnt"
        value="Abgelehnt"
        count={statusCounts["Abgelehnt"] || 0}
        isActive={currentStatus === "Abgelehnt"}
        onClick={handleFilterChange}
      />
      <FilterTab
        label="Angenommen"
        value="Angenommen"
        count={statusCounts["Angenommen"] || 0}
        isActive={currentStatus === "Angenommen"}
        onClick={handleFilterChange}
      />
    </div>
  );
};

export default FilterTabs;
