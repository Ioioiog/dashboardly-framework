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

interface PaymentListProps {
  payments: PaymentWithRelations[];
  userRole: "landlord" | "tenant";
}

export const PaymentList = ({ payments, userRole }: PaymentListProps) => {
  console.log("Rendering PaymentList with payments:", payments);

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
        {payments.map((payment) => {
          // Add null checks for nested objects
          const propertyName = payment.tenancy?.property?.name || "N/A";
          const propertyAddress = payment.tenancy?.property?.address || "N/A";
          const tenantFirstName = payment.tenancy?.tenant?.first_name || "";
          const tenantLastName = payment.tenancy?.tenant?.last_name || "";
          const tenantEmail = payment.tenancy?.tenant?.email || "N/A";

          return (
            <TableRow key={payment.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{propertyName}</div>
                  <div className="text-sm text-muted-foreground">
                    {propertyAddress}
                  </div>
                </div>
              </TableCell>
              {userRole === "landlord" && (
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {tenantFirstName && tenantLastName 
                        ? `${tenantFirstName} ${tenantLastName}`
                        : "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tenantEmail}
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
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};