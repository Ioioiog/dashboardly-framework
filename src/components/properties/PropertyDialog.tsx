import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PropertyForm } from "./PropertyForm";
import { Property } from "@/utils/propertyUtils";

interface PropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: ((data: any) => Promise<boolean>) | ((property: Property, data: any) => Promise<boolean>);
  property?: Property | null;
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
  const handleSubmit = async (data: any) => {
    if (mode === "edit" && property) {
      await (onSubmit as (property: Property, data: any) => Promise<boolean>)(property, data);
    } else {
      await (onSubmit as (data: any) => Promise<boolean>)(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Property" : "Edit Property"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" 
              ? "Add a new property to your portfolio." 
              : "Update your property details."}
          </DialogDescription>
        </DialogHeader>
        <PropertyForm
          onSubmit={handleSubmit}
          initialData={property}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}