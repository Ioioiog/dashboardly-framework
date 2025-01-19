import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export function InvoiceGenerationInfo() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Automatic Invoice Generation</h3>
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>How invoices are generated</AlertTitle>
        <AlertDescription className="mt-2">
          <p>Invoices are automatically generated for each active tenancy on their monthly renewal date. The system:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Generates invoices at midnight on the day matching the tenant's contract start date</li>
            <li>Includes the monthly rent amount</li>
            <li>Adds VAT if configured in your invoice settings</li>
            <li>Includes any pending utility bills</li>
            <li>Sets the due date to 14 days from generation</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}