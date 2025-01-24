import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Invoice } from "@/types/invoice";

interface InvoiceDetailsProps {
  invoice: Invoice;
  userRole: "landlord" | "tenant";
}

export function InvoiceDetails({ invoice, userRole }: InvoiceDetailsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <div className="text-sm font-medium text-gray-500">Property</div>
        <div>{invoice.property?.name}</div>
        <div className="text-sm text-gray-500">{invoice.property?.address}</div>
      </div>
      <div>
        <div className="text-sm font-medium text-gray-500">Tenant Email</div>
        <div className="text-sm text-gray-500">{invoice.tenant?.email || 'No email provided'}</div>
      </div>
      {userRole === "landlord" && (
        <div>
          <div className="text-sm font-medium text-gray-500">Tenant</div>
          <div>
            {invoice.tenant?.first_name} {invoice.tenant?.last_name}
          </div>
          <div className="text-sm text-gray-500">{invoice.tenant?.email}</div>
        </div>
      )}
      <div>
        <div className="text-sm font-medium text-gray-500">Amount</div>
        <div>${invoice.amount.toFixed(2)}</div>
      </div>
      <div>
        <div className="text-sm font-medium text-gray-500">Due Date</div>
        <div>{format(new Date(invoice.due_date), 'PPP')}</div>
      </div>
      <div>
        <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
          {invoice.status}
        </Badge>
      </div>
    </div>
  );
}