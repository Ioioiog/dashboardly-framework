import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Invoice } from "@/types/invoice";
import { format } from "date-fns";
import { PaymentActions } from "@/components/payments/PaymentActions";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InvoiceListProps {
  invoices: Invoice[];
  userRole: "landlord" | "tenant";
  onStatusUpdate?: () => void;
}

export function InvoiceList({ invoices, userRole, onStatusUpdate }: InvoiceListProps) {
  const { toast } = useToast();

  const handleDelete = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice deleted successfully!",
      });
      
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete invoice.",
      });
    }
  };

  const handleViewInvoice = async (invoiceId: string) => {
    // TODO: Implement invoice PDF generation and viewing
    console.log("Viewing invoice:", invoiceId);
  };

  return (
    <div className="grid gap-4">
      {invoices.map((invoice) => (
        <Card key={invoice.id}>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Property</div>
                <div>{invoice.property?.name}</div>
                <div className="text-sm text-gray-500">{invoice.property?.address}</div>
              </div>
              {userRole === "landlord" && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Tenant</div>
                  <div>
                    {invoice.tenant?.first_name} {invoice.tenant?.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{invoice.tenant?.email}</div>
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-gray-500">Amount</div>
                <div>${invoice.amount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Due Date</div>
                <div>{format(new Date(invoice.due_date), 'PPP')}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge
                  variant={invoice.status === "paid" ? "default" : "secondary"}
                >
                  {invoice.status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewInvoice(invoice.id)}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View Invoice
                </Button>
                {userRole === "landlord" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(invoice.id)}
                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
              {userRole === "landlord" ? (
                <div className="flex gap-2">
                  <PaymentActions
                    paymentId={invoice.id}
                    status={invoice.status}
                    userRole={userRole}
                  />
                </div>
              ) : (
                invoice.status !== "paid" && (
                  <PaymentActions
                    paymentId={invoice.id}
                    status={invoice.status}
                    userRole={userRole}
                  />
                )
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {invoices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No invoices found.
        </div>
      )}
    </div>
  );
}