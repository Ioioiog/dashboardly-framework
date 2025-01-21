import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaintenanceRequestStatus, MaintenancePriority, MaintenanceIssueType } from "@/types/maintenance";

interface MaintenanceFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: "all" | MaintenanceRequestStatus;
  setStatusFilter: (value: "all" | MaintenanceRequestStatus) => void;
  priorityFilter: "all" | MaintenancePriority;
  setPriorityFilter: (value: "all" | MaintenancePriority) => void;
  issueTypeFilter: "all" | MaintenanceIssueType;
  setIssueTypeFilter: (value: "all" | MaintenanceIssueType) => void;
}

export function MaintenanceFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  issueTypeFilter,
  setIssueTypeFilter,
}: MaintenanceFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | MaintenanceRequestStatus)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as "all" | MaintenancePriority)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
        <Select value={issueTypeFilter} onValueChange={(value) => setIssueTypeFilter(value as "all" | MaintenanceIssueType)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by issue type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Plumbing">Plumbing</SelectItem>
            <SelectItem value="Electrical">Electrical</SelectItem>
            <SelectItem value="HVAC">HVAC</SelectItem>
            <SelectItem value="Structural">Structural</SelectItem>
            <SelectItem value="Appliance">Appliance</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}