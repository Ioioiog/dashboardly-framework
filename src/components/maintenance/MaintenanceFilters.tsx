import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProperties } from "@/hooks/useProperties";
import { useUserRole } from "@/hooks/use-user-role";

interface MaintenanceFiltersProps {
  statusFilter: string;
  priorityFilter: string;
  propertyFilter: string;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onPropertyChange: (value: string) => void;
}

export function MaintenanceFilters({
  statusFilter,
  priorityFilter,
  propertyFilter,
  onStatusChange,
  onPriorityChange,
  onPropertyChange,
}: MaintenanceFiltersProps) {
  const { userRole } = useUserRole();
  const { properties } = useProperties({ userRole });

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priorityFilter} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
        </SelectContent>
      </Select>

      <Select value={propertyFilter} onValueChange={onPropertyChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by property" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Properties</SelectItem>
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              {property.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}