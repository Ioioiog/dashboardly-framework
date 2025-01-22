import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentWithRelations } from "@/integrations/supabase/types/payment";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PaymentActions } from "./PaymentActions";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentListProps {
  payments: PaymentWithRelations[];
  userRole: "landlord" | "tenant";
}

export const PaymentList = ({ payments, userRole }: PaymentListProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Function to refresh payments data
  const refreshPayments = () => {
    console.log("Refreshing payments data...");
    queryClient.invalidateQueries({ queryKey: ["payments"] });
  };

  const handleDelete = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from("payments")
        .delete()
        .eq("id", paymentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });

      refreshPayments();
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete payment",
      });
    }
  };

  // Set up real-time subscription with proper channel configuration
  useEffect(() => {
    console.log("Setting up real-time subscription for payments...");
    
    // Enable real-time subscription for the payments table
    const channel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'payments'
        },
        (payload) => {
          console.log("Received real-time update:", payload);
          // Immediately refresh the payments data when any change occurs
          refreshPayments();
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
        
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to payments changes");
        }
        
        if (status === 'CLOSED') {
          console.log("Subscription to payments changes closed");
        }
        
        if (status === 'CHANNEL_ERROR') {
          console.error("Error in payments subscription channel");
        }
      });

    return () => {
      console.log("Cleaning up real-time subscription...");
      supabase.removeChannel(channel);
    };
  }, [queryClient]); // Only re-run if queryClient changes

  if (payments.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No payments found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Property</TableHead>
          {userRole === "landlord" && <TableHead>Tenant</TableHead>}
          <TableHead>Amount</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Paid Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
          {userRole === "landlord" && <TableHead className="w-[50px]"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              <div>
                <div className="font-medium">
                  {payment.tenancy.property.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {payment.tenancy.property.address}
                </div>
              </div>
            </TableCell>
            {userRole === "landlord" && (
              <TableCell>
                <div>
                  <div className="font-medium">
                    {payment.tenancy.tenant.first_name}{" "}
                    {payment.tenancy.tenant.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {payment.tenancy.tenant.email}
                  </div>
                </div>
              </TableCell>
            )}
            <TableCell>${payment.amount}</TableCell>
            <TableCell>{format(new Date(payment.due_date), "PPP")}</TableCell>
            <TableCell>
              {payment.paid_date
                ? format(new Date(payment.paid_date), "PPP")
                : "-"}
            </TableCell>
            <TableCell>
              <PaymentStatusBadge status={payment.status} />
            </TableCell>
            <TableCell>
              <PaymentActions
                paymentId={payment.id}
                status={payment.status}
                userRole={userRole}
                onStatusChange={refreshPayments}
              />
            </TableCell>
            {userRole === "landlord" && (
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(payment.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};