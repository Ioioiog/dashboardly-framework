import { Button } from "@/components/ui/button";
import { FileText, Trash2, Eye, Mail, CreditCard } from "lucide-react";
import { PaymentActions } from "@/components/payments/PaymentActions";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InvoiceActionsProps {
  invoiceId: string;
  status: string;
  userRole: "landlord" | "tenant";
  onStatusUpdate?: () => void;
  onViewInvoice: () => void;
  isSendingEmail: boolean;
}

export function InvoiceActions({
  invoiceId,
  status,
  userRole,
  onStatusUpdate,
  onViewInvoice,
  isSendingEmail,
}: InvoiceActionsProps) {
  const { toast } = useToast();

  const handleDelete = async () => {
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

  const handleViewDocument = async () => {
    try {
      const { data: documents, error: documentsError } = await supabase
        .storage
        .from('invoice-documents')
        .list(invoiceId);

      if (documentsError) throw documentsError;

      if (documents && documents.length > 0) {
        const { data } = await supabase
          .storage
          .from('invoice-documents')
          .createSignedUrl(`${invoiceId}/${documents[0].name}`, 60);

        if (data) {
          window.open(data.signedUrl, '_blank');
        }
      }
    } catch (error) {
      console.error("Error viewing document:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to retrieve document.",
      });
    }
  };

  const handleSendEmail = async () => {
    try {
      console.log("Sending email for invoice:", invoiceId);
      
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: { invoiceId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice email sent successfully!",
      });
    } catch (error) {
      console.error("Error sending invoice email:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invoice email.",
      });
    }
  };

  const handlePayment = async () => {
    try {
      console.log("Creating payment session for invoice:", invoiceId);
      
      const { data, error } = await supabase.functions.invoke('create-payment-checkout', {
        body: { paymentId: invoiceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating payment session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initiate payment.",
      });
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onViewInvoice}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        View Invoice
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleViewDocument}
        className="flex items-center gap-2"
      >
        <Eye className="h-4 w-4" />
        See Details
      </Button>
      {userRole === "landlord" && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendEmail}
            disabled={isSendingEmail}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Send Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </>
      )}
      {userRole === "tenant" && status !== "paid" && (
        <Button
          variant="default"
          size="sm"
          onClick={handlePayment}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <CreditCard className="h-4 w-4" />
          Pay Now
        </Button>
      )}
      {userRole === "landlord" ? (
        <div className="flex gap-2">
          <PaymentActions
            paymentId={invoiceId}
            status={status}
            userRole={userRole}
            onStatusChange={onStatusUpdate}
          />
        </div>
      ) : (
        status !== "paid" && (
          <PaymentActions
            paymentId={invoiceId}
            status={status}
            userRole={userRole}
            onStatusChange={onStatusUpdate}
          />
        )
      )}
    </div>
  );
}