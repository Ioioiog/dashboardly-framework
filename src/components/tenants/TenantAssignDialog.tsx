import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Property } from "@/utils/propertyUtils";
import { TenantAssignForm } from "./TenantAssignForm";

interface TenantAssignDialogProps {
  properties: Property[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TenantAssignDialog({ properties, open, onOpenChange }: TenantAssignDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Existing Tenant</DialogTitle>
          <DialogDescription>
            Select a tenant and assign them to one or more properties. This will create new tenancy records.
          </DialogDescription>
        </DialogHeader>
        <TenantAssignForm properties={properties} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}