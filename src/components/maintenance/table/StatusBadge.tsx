import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface StatusBadgeProps {
  status: 'pending' | 'in_progress' | 'completed';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "in_progress":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {t(`maintenance.status.${status}`)}
    </Badge>
  );
}