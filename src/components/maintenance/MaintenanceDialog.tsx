import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MaintenanceForm } from "./MaintenanceForm";

interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaintenanceDialog({ open, onOpenChange }: MaintenanceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Maintenance Request</DialogTitle>
        </DialogHeader>
        <MaintenanceForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}