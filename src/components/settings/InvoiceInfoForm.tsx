import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Receipt, CreditCard } from "lucide-react";

export function InvoiceInfoForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-6">
          <div className="flex items-center space-x-4">
            <FileText className="h-6 w-6 text-blue-500" />
            <div>
              <h3 className="font-medium">Invoice Generation</h3>
              <p className="text-sm text-muted-foreground">
                Invoices are automatically generated on the 1st of each month
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Receipt className="h-6 w-6 text-green-500" />
            <div>
              <h3 className="font-medium">Payment Processing</h3>
              <p className="text-sm text-muted-foreground">
                Payments are processed through Stripe and typically settle within 2-3 business days
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <CreditCard className="h-6 w-6 text-purple-500" />
            <div>
              <h3 className="font-medium">Payment Methods</h3>
              <p className="text-sm text-muted-foreground">
                You can accept payments via credit card, debit card, and bank transfer
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}