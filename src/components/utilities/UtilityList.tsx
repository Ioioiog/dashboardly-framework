import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PaymentActions } from "@/components/payments/PaymentActions";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface Utility {
  id: string;
  type: string;
  amount: number;
  due_date: string;
  status: string;
  property: {
    name: string;
    address: string;
  };
}

interface UtilityListProps {
  utilities: Utility[];
  userRole: "landlord" | "tenant";
  onStatusUpdate?: () => void;
}

export function UtilityList({ utilities, userRole, onStatusUpdate }: UtilityListProps) {
  const { toast } = useToast();

  const handleStatusUpdate = async (utilityId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("utilities")
        .update({ status: newStatus })
        .eq("id", utilityId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Utility bill status updated successfully!",
      });
      
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error("Error updating utility status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update utility bill status.",
      });
    }
  };

  const handleViewInvoice = async (utilityId: string) => {
    try {
      // First get the invoice details
      const { data: invoices, error: invoiceError } = await supabase
        .from('utility_invoices')
        .select('pdf_path')
        .eq('utility_id', utilityId)
        .single();

      if (invoiceError) throw invoiceError;

      if (!invoices?.pdf_path) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No invoice file found for this utility bill.",
        });
        return;
      }

      // Get the temporary URL for the file
      const { data: { signedUrl }, error: urlError } = await supabase
        .storage
        .from('utility-invoices')
        .createSignedUrl(invoices.pdf_path, 60); // URL valid for 60 seconds

      if (urlError) throw urlError;

      // Open the PDF in a new tab
      window.open(signedUrl, '_blank');
    } catch (error) {
      console.error("Error viewing invoice:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to retrieve the invoice file.",
      });
    }
  };

  return (
    <div className="grid gap-4">
      {utilities.map((utility) => (
        <Card key={utility.id}>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Property</div>
                <div>{utility.property.name}</div>
                <div className="text-sm text-gray-500">{utility.property.address}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Type</div>
                <div className="capitalize">{utility.type}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Amount</div>
                <div>${utility.amount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Due Date</div>
                <div>{new Date(utility.due_date).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge
                  variant={utility.status === "paid" ? "default" : "secondary"}
                >
                  {utility.status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewInvoice(utility.id)}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  See Invoice
                </Button>
              </div>
              {userRole === "landlord" ? (
                <div className="flex gap-2">
                  <PaymentActions
                    paymentId={utility.id}
                    status={utility.status}
                    userRole={userRole}
                  />
                </div>
              ) : (
                utility.status !== "paid" && (
                  <PaymentActions
                    paymentId={utility.id}
                    status={utility.status}
                    userRole={userRole}
                  />
                )
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {utilities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No utility bills found.
        </div>
      )}
    </div>
  );
}