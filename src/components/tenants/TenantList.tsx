import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { Tenant } from "@/types/tenant";
import { EditTenantDialog } from "./EditTenantDialog";

interface TenantListProps {
  tenants: Tenant[];
}

export function TenantList({ tenants }: TenantListProps) {
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleUpdate = () => {
    console.log("Tenant updated, refreshing list");
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((tenant) => (
            <TableRow key={tenant.id}>
              <TableCell>
                {tenant.first_name} {tenant.last_name}
              </TableCell>
              <TableCell>
                <div>{tenant.email}</div>
                <div className="text-sm text-gray-500">{tenant.phone}</div>
              </TableCell>
              <TableCell>
                <div>{tenant.property.name}</div>
                <div className="text-sm text-gray-500">
                  {tenant.property.address}
                </div>
              </TableCell>
              <TableCell>
                {new Date(tenant.tenancy.start_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {tenant.tenancy.end_date
                  ? new Date(tenant.tenancy.end_date).toLocaleDateString()
                  : "No end date"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    tenant.tenancy.status === "active" ? "default" : "secondary"
                  }
                >
                  {tenant.tenancy.status}
                </Badge>
              </TableCell>
              <TableCell>
                <EditTenantDialog tenant={tenant} onUpdate={handleUpdate} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}