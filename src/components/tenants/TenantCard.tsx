import React from "react";
import { format } from "date-fns";
import { Tenant } from "@/types/tenant";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
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

interface TenantCardProps {
  tenant: Tenant;
  onDelete: (tenantId: string) => Promise<void>;
  onUpdate: () => void;
  getTenantDisplayName: (tenant: Tenant) => string;
  getStatusBadgeColor: (status: string) => string;
}

export function TenantCard({
  tenant,
  onDelete,
  onUpdate,
  getTenantDisplayName,
  getStatusBadgeColor,
}: TenantCardProps) {
  if (!tenant || !tenant.property) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="font-semibold">{getTenantDisplayName(tenant)}</h3>
        {tenant.tenancy && (
          <Badge className={getStatusBadgeColor(tenant.tenancy.status)}>
            {tenant.tenancy.status}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{tenant.email || "N/A"}</p>
          <p className="text-sm text-muted-foreground">{tenant.phone || "N/A"}</p>
          <p className="text-sm">{tenant.property.name} ({tenant.property.address})</p>
          <div className="text-sm">
            <p>Start: {tenant.tenancy?.start_date ? format(new Date(tenant.tenancy.start_date), "MMM d, yyyy") : "N/A"}</p>
            <p>End: {tenant.tenancy?.end_date ? format(new Date(tenant.tenancy.end_date), "MMM d, yyyy") : "Ongoing"}</p>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}