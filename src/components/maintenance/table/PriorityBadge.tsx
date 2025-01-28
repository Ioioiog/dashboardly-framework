import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface PriorityBadgeProps {
  priority?: string;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { t } = useTranslation();

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-orange-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Badge className={getPriorityColor(priority || "")}>
      {t(`maintenance.priority.${priority?.toLowerCase()}`)}
    </Badge>
  );
}