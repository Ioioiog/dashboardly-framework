import { Badge } from "@/components/ui/badge";

interface TenancyStatusProps {
  status: string;
}

export function TenancyStatus({ status }: TenancyStatusProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Badge className={getStatusBadgeColor(status)}>
      {status}
    </Badge>
  );
}