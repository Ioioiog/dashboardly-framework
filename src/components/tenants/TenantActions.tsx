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

interface TenantActionsProps {
  tenantId: string;
  tenantName: string;
  onDelete: (tenantId: string) => Promise<void>;
  onUpdate: () => void;
}

export function TenantActions({ tenantId, tenantName, onDelete, onUpdate }: TenantActionsProps) {
  return (
    <div className="flex justify-end space-x-2">
      <TenantObservationDialog
        tenantId={tenantId}
        tenantName={tenantName}
      />
      <EditTenantDialog tenant={{ id: tenantId }} onUpdate={onUpdate} />
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
              onClick={() => onDelete(tenantId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}