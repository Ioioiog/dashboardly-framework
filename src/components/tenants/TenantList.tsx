import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditTenantDialog } from "./EditTenantDialog";
import { Tenant } from "@/types/tenant";
import { format } from "date-fns";

interface TenantListProps {
  tenants: Tenant[];
}

export function TenantList({ tenants }: TenantListProps) {
  console.log("Rendering TenantList with tenants:", tenants);

  if (!tenants.length) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow p-8 text-center">
        <p className="text-muted-foreground">No tenants found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((tenant) => (
            <TableRow key={`${tenant.id}-${tenant.property.id}-${tenant.tenancy.start_date}`}>
              <TableCell>
                {tenant.first_name} {tenant.last_name}
              </TableCell>
              <TableCell>{tenant.email}</TableCell>
              <TableCell>{tenant.phone || "N/A"}</TableCell>
              <TableCell>
                {tenant.property.name} ({tenant.property.address})
              </TableCell>
              <TableCell>
                {tenant.tenancy.start_date
                  ? format(new Date(tenant.tenancy.start_date), "MMM d, yyyy")
                  : "N/A"}
              </TableCell>
              <TableCell>
                {tenant.tenancy.end_date
                  ? format(new Date(tenant.tenancy.end_date), "MMM d, yyyy")
                  : "Ongoing"}
              </TableCell>
              <TableCell className="text-right">
                <EditTenantDialog tenant={tenant} onUpdate={() => {}} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}