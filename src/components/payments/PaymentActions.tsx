import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentActionsProps {
  paymentId: string;
  status: string;
  userRole: "landlord" | "tenant";
  onStatusChange: () => void;
}

export const PaymentActions = ({
  paymentId,
  status,
  userRole,
  onStatusChange,
}: PaymentActionsProps) => {
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("payments")
        .update({ status: newStatus })
        .eq("id", paymentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Payment marked as ${newStatus}`,
      });

      onStatusChange();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update payment status",
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
            <Check className="mr-2 h-4 w-4" />
            Mark as Paid
          </DropdownMenuItem>
        )}
        {status !== "overdue" && (
          <DropdownMenuItem onClick={() => handleStatusChange("overdue")}>
            <X className="mr-2 h-4 w-4" />
            Mark as Overdue
          </DropdownMenuItem>
        )}
        {status !== "pending" && (
          <DropdownMenuItem onClick={() => handleStatusChange("pending")}>
            <X className="mr-2 h-4 w-4" />
            Mark as Pending
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};