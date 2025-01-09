import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentActionsProps {
  paymentId: string;
  status: string;
  userRole: "landlord" | "tenant";
}

export function PaymentActions({ paymentId, status, userRole }: PaymentActionsProps) {
  const { toast } = useToast();
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);

  const updatePaymentStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("payments")
        .update({ status: newStatus })
        .eq("id", paymentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment status updated successfully.",
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment status.",
      });
    }
  };

  const handlePayment = async () => {
    try {
      setProcessingPaymentId(paymentId);
      console.log('Initiating payment for ID:', paymentId);
      
      const { data, error } = await supabase.functions.invoke('create-payment-checkout', {
        body: { paymentId }
      });

      if (error) {
        console.error('Payment initiation error:', error);
        throw error;
      }

      if (!data?.url) {
        console.error('No checkout URL received');
        throw new Error('No checkout URL received');
      }

      console.log('Redirecting to checkout URL:', data.url);
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
      });
    } finally {
      setProcessingPaymentId(null);
    }
  };

  if (userRole === "landlord") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => updatePaymentStatus("paid")}>
            Mark as Paid
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updatePaymentStatus("pending")}>
            Mark as Pending
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updatePaymentStatus("overdue")}>
            Mark as Overdue
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (status !== "paid") {
    return (
      <Button
        onClick={handlePayment}
        size="sm"
        disabled={processingPaymentId === paymentId}
      >
        {processingPaymentId === paymentId ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : null}
        {processingPaymentId === paymentId ? "Processing..." : "Pay Now"}
      </Button>
    );
  }

  return null;
}