import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PropertyForm } from "./PropertyForm";
import { Property } from "@/utils/propertyUtils";

interface PropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  property?: Property;
  isSubmitting?: boolean;
  mode: "add" | "edit";
}

export function PropertyDialog({
  open,
  onOpenChange,
  onSubmit,
  property,
  isSubmitting,
  mode,
}: PropertyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Property" : "Edit Property"}
          </DialogTitle>
        </DialogHeader>
        <PropertyForm
          onSubmit={onSubmit}
          initialData={property}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}