import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PaymentActions } from "@/components/payments/PaymentActions";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface Utility {
  id: string;
  type: string;
  amount: number;
  due_date: string;
  status: string;
  property: {
    name: string;
    address: string;
  } | null;
}

interface UtilityListProps {
  utilities: Utility[];
  userRole: "landlord" | "tenant";
  onStatusUpdate?: () => void;
}

export function UtilityList({ utilities, userRole, onStatusUpdate }: UtilityListProps) {
  const { toast } = useToast();
  const { formatAmount } = useCurrency();

  const handleStatusUpdate = async (utilityId: string, newStatus: string) => {
    try {
      console.log('Updating utility status:', { utilityId, newStatus });
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
      console.log("Fetching invoice for utility ID:", utilityId);
      
      const { data: invoice, error: invoiceError } = await supabase
        .from('utility_invoices')
        .select('pdf_path')
        .eq('utility_id', utilityId)
        .maybeSingle();

      if (invoiceError) {
        console.error("Error fetching invoice:", invoiceError);
        throw invoiceError;
      }

      if (!invoice) {
        console.log("No invoice found for utility ID:", utilityId);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No invoice file found for this utility bill.",
        });
        return;
      }

      if (!invoice.pdf_path) {
        console.log("Invoice found but no PDF path for utility ID:", utilityId);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No invoice file has been uploaded for this utility bill.",
        });
        return;
      }

      console.log("Creating signed URL for PDF path:", invoice.pdf_path);
      
      const { data: { signedUrl }, error: urlError } = await supabase
        .storage
        .from('utility-invoices')
        .createSignedUrl(invoice.pdf_path, 60);

      if (urlError) {
        console.error("Error creating signed URL:", urlError);
        throw urlError;
      }

      console.log("Opening signed URL in new tab");
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

  const handleDelete = async (utilityId: string) => {
    try {
      console.log("Deleting utility with ID:", utilityId);
      
      const { error } = await supabase
        .from('utilities')
        .delete()
        .eq('id', utilityId);

      if (error) {
        console.error("Error deleting utility:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Utility bill deleted successfully!",
      });
      
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error("Error deleting utility:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete utility bill.",
      });
    }
  };

  if (!Array.isArray(utilities)) {
    console.error("Utilities prop is not an array:", utilities);
    return (
      <div className="text-center py-8 text-gray-500">
        Error loading utilities.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {utilities.map((utility) => {
        if (!utility?.id) {
          console.error("Invalid utility object:", utility);
          return null;
        }

        return (
          <Card key={utility.id}>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Property</div>
                  <div>{utility.property?.name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{utility.property?.address || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Type</div>
                  <div className="capitalize">{utility.type}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Amount</div>
                  <div>{formatAmount(utility.amount)}</div>
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
                  {userRole === "landlord" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(utility.id)}
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
                      paymentId={utility.id}
                      status={utility.status}
                      userRole={userRole}
                      onStatusChange={onStatusUpdate}
                    />
                  </div>
                ) : (
                  utility.status !== "paid" && (
                    <PaymentActions
                      paymentId={utility.id}
                      status={utility.status}
                      userRole={userRole}
                      onStatusChange={onStatusUpdate}
                    />
                  )
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
      {utilities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No utility bills found.
        </div>
      )}
    </div>
  );
}
