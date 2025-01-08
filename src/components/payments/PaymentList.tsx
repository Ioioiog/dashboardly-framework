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
import { PaymentWithRelations } from "@/integrations/supabase/types/payment";

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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};