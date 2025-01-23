import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProperties } from "@/hooks/useProperties";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priorityFilter} onValueChange={onPriorityChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Priorities</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
        </SelectContent>
      </Select>

      {userRole === 'landlord' && (
        <Select value={propertyFilter} onValueChange={onPropertyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Properties</SelectItem>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}