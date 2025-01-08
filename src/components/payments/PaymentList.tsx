import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { PaymentWithRelations } from "@/integrations/supabase/types/payment";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentListProps {
  payments: PaymentWithRelations[];
  userRole: "landlord" | "tenant";
}

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "default";
    case "pending":
      return "secondary";
    case "overdue":
      return "destructive";
    default:
      return "outline";
  }
};

export const PaymentList = ({ payments, userRole }: PaymentListProps) => {
  const { toast } = useToast();

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
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

  const handlePayment = async (paymentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-checkout', {
        body: { paymentId }
      });

      if (error) throw error;
      if (!data.url) throw new Error('No checkout URL received');

      window.location.href = data.url;
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
      });
    }
  };

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
              <Badge variant={getStatusBadgeVariant(payment.status)}>
                {payment.status}
              </Badge>
            </TableCell>
            <TableCell>
              {userRole === "landlord" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => updatePaymentStatus(payment.id, "paid")}
                    >
                      Mark as Paid
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updatePaymentStatus(payment.id, "pending")}
                    >
                      Mark as Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updatePaymentStatus(payment.id, "overdue")}
                    >
                      Mark as Overdue
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                payment.status !== "paid" && (
                  <Button
                    onClick={() => handlePayment(payment.id)}
                    size="sm"
                  >
                    Pay Now
                  </Button>
                )
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};