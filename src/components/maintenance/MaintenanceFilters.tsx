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
import { useUserRole } from "@/hooks/use-user-role";

interface MaintenanceFiltersProps {
  filters: {
    status: string;
    priority: "low" | "medium" | "high" | "all";
    propertyId: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function MaintenanceFilters({
  filters,
  onFiltersChange,
}: MaintenanceFiltersProps) {
  const { t } = useTranslation();
  const { userRole } = useUserRole();

  const { data: properties } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      console.log("Fetching properties for filters");
      const { data, error } = await supabase
        .from("properties")
        .select("id, name");
      if (error) throw error;
      console.log("Fetched properties:", data);
      return data;
    },
  });

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">
          {t("maintenance.filters.status")}
        </label>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, status: value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("maintenance.filters.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("maintenance.filters.allStatuses")}</SelectItem>
            <SelectItem value="pending">{t("maintenance.status.pending")}</SelectItem>
            <SelectItem value="in_progress">{t("maintenance.status.in_progress")}</SelectItem>
            <SelectItem value="completed">{t("maintenance.status.completed")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">
          {t("maintenance.filters.priority")}
        </label>
        <Select
          value={filters.priority}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, priority: value as "low" | "medium" | "high" | "all" })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("maintenance.filters.priority")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("maintenance.filters.allPriorities")}</SelectItem>
            <SelectItem value="low">{t("maintenance.priority.low")}</SelectItem>
            <SelectItem value="medium">{t("maintenance.priority.medium")}</SelectItem>
            <SelectItem value="high">{t("maintenance.priority.high")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {userRole === "landlord" && (
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">
            {t("maintenance.filters.property")}
          </label>
          <Select
            value={filters.propertyId}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, propertyId: value })
            }
          >
            <SelectTrigger className="w-full">
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
      )}
    </div>
  );
}