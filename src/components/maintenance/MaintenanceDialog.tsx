import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MaintenanceRequest } from "@/types/maintenance";
import { MaintenanceForm } from "./MaintenanceForm";

interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: MaintenanceRequest | null;
}

export function MaintenanceDialog({
  open,
  onOpenChange,
  request,
}: MaintenanceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {request ? "Edit Maintenance Request" : "New Maintenance Request"}
          </DialogTitle>
        </DialogHeader>
        <MaintenanceForm request={request} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}