import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceFiltersProps {
  filters: {
    status: string;
    priority: string;
    propertyId: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function MaintenanceFilters({
  filters,
  onFiltersChange,
}: MaintenanceFiltersProps) {
  const { t } = useTranslation();

  const { data: properties } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex gap-4">
      <Select
        value={filters.status}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, status: value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("maintenance.filters.status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("maintenance.filters.allStatuses")}</SelectItem>
          <SelectItem value="pending">{t("maintenance.status.pending")}</SelectItem>
          <SelectItem value="in_progress">{t("maintenance.status.in_progress")}</SelectItem>
          <SelectItem value="completed">{t("maintenance.status.completed")}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, priority: value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("maintenance.filters.priority")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("maintenance.filters.allPriorities")}</SelectItem>
          <SelectItem value="low">{t("maintenance.priority.low")}</SelectItem>
          <SelectItem value="medium">{t("maintenance.priority.medium")}</SelectItem>
          <SelectItem value="high">{t("maintenance.priority.high")}</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.propertyId}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, propertyId: value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("maintenance.filters.property")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("maintenance.filters.allProperties")}</SelectItem>
          {properties?.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              {property.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}