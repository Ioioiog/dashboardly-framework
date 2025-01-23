import { Dialog, DialogContent } from "@/components/ui/dialog";
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
      <DialogContent className="max-w-3xl">
        <MaintenanceForm request={request} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}