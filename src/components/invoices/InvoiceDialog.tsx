import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { InvoiceForm } from "./InvoiceForm";

interface InvoiceDialogProps {
  onInvoiceCreated?: () => Promise<void>;
}

export function InvoiceDialog({ onInvoiceCreated }: InvoiceDialogProps) {
  const [open, setOpen] = useState(false);

  const handleInvoiceCreated = async () => {
    if (onInvoiceCreated) {
      await onInvoiceCreated();
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-4">
          Note: Invoices are automatically generated on the monthly renewal date of each active tenancy.
          Manual invoice creation should only be used for special cases.
        </div>
        <InvoiceForm onSuccess={handleInvoiceCreated} />
      </DialogContent>
    </Dialog>
  );
}