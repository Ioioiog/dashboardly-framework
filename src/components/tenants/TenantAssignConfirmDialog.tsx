import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Property } from "@/utils/propertyUtils";
import { ProfileSchema } from "@/integrations/supabase/database-types/profile";

interface TenantAssignConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  tenant: ProfileSchema["Tables"]["profiles"]["Row"] | undefined;
  properties: Property[];
  propertyIds: string[];
  startDate: string;
  endDate?: string;
}

export function TenantAssignConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  tenant,
  properties,
  propertyIds,
  startDate,
  endDate,
}: TenantAssignConfirmDialogProps) {
  const selectedProperties = properties.filter(p => propertyIds.includes(p.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Tenant Assignment</DialogTitle>
          <DialogDescription>
            Please review the assignment details before confirming.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Tenant</h4>
            <p className="text-sm text-muted-foreground">
              {tenant?.first_name} {tenant?.last_name}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Properties</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {selectedProperties.map(property => (
                <li key={property.id}>{property.name}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Duration</h4>
            <p className="text-sm text-muted-foreground">
              From: {format(new Date(startDate), 'PPP')}
              {endDate && ` To: ${format(new Date(endDate), 'PPP')}`}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}