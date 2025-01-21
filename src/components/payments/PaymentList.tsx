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

interface PaymentListProps {
  payments: PaymentWithRelations[];
  userRole: "landlord" | "tenant";
}

export const PaymentList = ({ payments, userRole }: PaymentListProps) => {
  // Get the query client instance
  const queryClient = useQueryClient();

  // Function to refresh payments data
  const refreshPayments = () => {
    console.log("Refreshing payments data...");
    queryClient.invalidateQueries({ queryKey: ["payments"] });
  };

  // Set up real-time subscription
  useEffect(() => {
    console.log("Setting up real-time subscription for payments...");
    const channel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'payments'
        },
        (payload) => {
          console.log("Received real-time update:", payload);
          refreshPayments();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up real-time subscription...");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
          <TableHead className="w-[100px]"></TableHead>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};