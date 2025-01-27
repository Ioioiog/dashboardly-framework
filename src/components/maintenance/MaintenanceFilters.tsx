import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProperties } from "@/hooks/useProperties";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface MaintenanceFiltersProps {
  statusFilter: string;
  priorityFilter: string;
  propertyFilter: string;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onPropertyChange: (value: string) => void;
  userRole: string | null;
}

export function MaintenanceFilters({
  statusFilter,
  priorityFilter,
  propertyFilter,
  onStatusChange,
  onPriorityChange,
  onPropertyChange,
  userRole,
}: MaintenanceFiltersProps) {
  const { properties } = useProperties({ userRole: userRole as "landlord" | "tenant" });
  const { t } = useTranslation();

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('maintenance.filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('maintenance.filters.allStatuses')}</SelectItem>
            <SelectItem value="pending">{t('maintenance.status.pending')}</SelectItem>
            <SelectItem value="in_progress">{t('maintenance.status.in_progress')}</SelectItem>
            <SelectItem value="completed">{t('maintenance.status.completed')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={onPriorityChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('maintenance.filters.priority')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('maintenance.filters.allPriorities')}</SelectItem>
            <SelectItem value="low">{t('maintenance.priority.low')}</SelectItem>
            <SelectItem value="medium">{t('maintenance.priority.medium')}</SelectItem>
            <SelectItem value="high">{t('maintenance.priority.high')}</SelectItem>
          </SelectContent>
        </Select>

        {userRole === 'landlord' && (
          <Select value={propertyFilter} onValueChange={onPropertyChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('maintenance.filters.property')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('maintenance.filters.allProperties')}</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </Card>
  );
}