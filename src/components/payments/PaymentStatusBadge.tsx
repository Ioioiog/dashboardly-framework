import { Badge } from "@/components/ui/badge";

interface PaymentStatusBadgeProps {
  status: string;
}

export const getStatusBadgeVariant = (status: string) => {
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

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <Badge variant={getStatusBadgeVariant(status)}>
      {status}
    </Badge>
  );
}