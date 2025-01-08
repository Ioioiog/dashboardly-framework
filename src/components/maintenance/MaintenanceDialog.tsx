import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MaintenanceForm } from "./MaintenanceForm";
import { MaintenanceRequest } from "@/types/maintenance";

interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: MaintenanceRequest;
}

export function MaintenanceDialog({ open, onOpenChange, request }: MaintenanceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {request ? "Edit Maintenance Request" : "New Maintenance Request"}
          </DialogTitle>
        </DialogHeader>
        <MaintenanceForm
          onSuccess={() => onOpenChange(false)}
          request={request}
        />
      </DialogContent>
    </Dialog>
  );
}