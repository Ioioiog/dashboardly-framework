import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
      <DialogContent aria-describedby="maintenance-dialog-description">
        <DialogHeader>
          <DialogTitle>
            {request ? "Edit Maintenance Request" : "New Maintenance Request"}
          </DialogTitle>
          <DialogDescription id="maintenance-dialog-description">
            {request 
              ? "Update the details of your maintenance request."
              : "Submit a new maintenance request for your property. Please provide as much detail as possible."}
          </DialogDescription>
        </DialogHeader>
        <MaintenanceForm
          onSuccess={() => onOpenChange(false)}
          request={request}
        />
      </DialogContent>
    </Dialog>
  );
}