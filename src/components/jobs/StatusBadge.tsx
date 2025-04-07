import { StatusBadgeProps } from "@/lib/types";

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusClasses = {
    Beworben: "status-applied",
    Interview: "status-interview",
    Abgelehnt: "status-rejected",
    Angenommen: "status-accepted",
  };

  return (
    <span
      className={
        statusClasses[status] ||
        "bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium"
      }
    >
      {status}
    </span>
  );
}
