import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export function InvoiceDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Invoice</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invoice Generation</DialogTitle>
          <DialogDescription>
            Invoices are now generated automatically
          </DialogDescription>
        </DialogHeader>
        
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Invoices are automatically generated on each tenant's monthly renewal date.
            They include rent, VAT (if configured), and any pending utility bills.
            To create a one-time invoice for additional charges, please use the Payments section.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
}