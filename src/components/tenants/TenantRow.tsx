import React from "react";
import { format } from "date-fns";
import { Tenant } from "@/types/tenant";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { TenantObservationDialog } from "./TenantObservationDialog";
import { EditTenantDialog } from "./EditTenantDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TenantRowProps {
  tenant: Tenant;
  onDelete: (tenantId: string) => Promise<void>;
  onUpdate: () => void;
  getTenantDisplayName: (tenant: Tenant) => string;
  getStatusBadgeColor: (status: string) => string;
}

export function TenantRow({
  tenant,
  onDelete,
  onUpdate,
  getTenantDisplayName,
  getStatusBadgeColor,
}: TenantRowProps) {
  if (!tenant || !tenant.property) return null;

  return (
    <TableRow>
      <TableCell>{getTenantDisplayName(tenant)}</TableCell>
      <TableCell>{tenant.email || "N/A"}</TableCell>
      <TableCell>{tenant.phone || "N/A"}</TableCell>
      <TableCell>
        {tenant.property.name} ({tenant.property.address})
      </TableCell>
      <TableCell>
        {tenant.tenancy?.start_date
          ? format(new Date(tenant.tenancy.start_date), "MMM d, yyyy")
          : "N/A"}
      </TableCell>
      <TableCell>
        {tenant.tenancy?.end_date
          ? format(new Date(tenant.tenancy.end_date), "MMM d, yyyy")
          : "Ongoing"}
      </TableCell>
      <TableCell>
        {tenant.tenancy && (
          <Badge className={getStatusBadgeColor(tenant.tenancy.status)}>
            {tenant.tenancy.status}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right space-x-2">
        <TenantObservationDialog
          tenantId={tenant.id}
          tenantName={getTenantDisplayName(tenant)}
        />
        <EditTenantDialog tenant={tenant} onUpdate={onUpdate} />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Tenant</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this tenant? This action will remove all tenant observations and interactions, and mark their tenancy as inactive.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(tenant.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}