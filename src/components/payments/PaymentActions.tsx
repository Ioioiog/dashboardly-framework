import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentActionsProps {
  paymentId: string;
  status: string;
  userRole: "landlord" | "tenant";
  onStatusChange: () => void;
}

export function PaymentActions({ paymentId, status, userRole, onStatusChange }: PaymentActionsProps) {
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    try {
      console.log("Updating payment status:", { paymentId, newStatus });
      const { error } = await supabase
        .from("payments")
        .update({ 
          status: newStatus,
          paid_date: newStatus === "paid" ? new Date().toISOString() : null 
        })
        .eq("id", paymentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });

      // Call the onStatusChange callback to refresh the list
      onStatusChange();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment status",
      });
    }
  };

  if (userRole !== "landlord") {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {status !== "paid" && (
          <DropdownMenuItem onClick={() => handleStatusChange("paid")}>
            Mark as Paid
          </DropdownMenuItem>
        )}
        {status !== "pending" && (
          <DropdownMenuItem onClick={() => handleStatusChange("pending")}>
            Mark as Pending
          </DropdownMenuItem>
        )}
        {status !== "overdue" && (
          <DropdownMenuItem onClick={() => handleStatusChange("overdue")}>
            Mark as Overdue
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}