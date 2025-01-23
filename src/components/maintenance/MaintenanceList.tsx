import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MaintenanceRequest } from "@/types/maintenance";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface MaintenanceListProps {
  requests: MaintenanceRequest[];
  isLoading: boolean;
  onRequestClick: (request: MaintenanceRequest) => void;
}

export function MaintenanceList({
  requests,
  isLoading,
  onRequestClick,
}: MaintenanceListProps) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!requests.length) {
    return <div>No maintenance requests found.</div>;
  }

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-orange-500";
      case "Low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Property</TableHead>
          <TableHead>Tenant</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow
            key={request.id}
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => onRequestClick(request)}
          >
            <TableCell>{request.property?.name}</TableCell>
            <TableCell>
              {request.tenant?.first_name} {request.tenant?.last_name}
            </TableCell>
            <TableCell>{request.title}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(request.status)}>
                {request.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={getPriorityColor(request.priority || "")}>
                {request.priority}
              </Badge>
            </TableCell>
            <TableCell>
              {format(new Date(request.created_at), "PPP")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}