import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TenancyStatusProps {
  status: string;
  tenancyId?: string;
  onStatusChange?: () => void;
  isLandlord?: boolean;
}

export function TenancyStatus({ status, tenancyId, onStatusChange, isLandlord = false }: TenancyStatusProps) {
  const { toast } = useToast();

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

  const handleStatusChange = async () => {
    if (!tenancyId) return;

    try {
      console.log("Updating tenancy status...", tenancyId);
      const { error } = await supabase
        .from('tenancies')
        .update({ status: 'active' })
        .eq('id', tenancyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenant status updated successfully",
      });

      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error updating tenant status:", error);
      toast({
        title: "Error",
        description: "Failed to update tenant status",
        variant: "destructive",
      });
    }
  };

  if (isLandlord && status === 'inactive') {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleStatusChange}
        className="hover:bg-green-50 hover:text-green-600 transition-colors"
      >
        Reactivate Tenant
      </Button>
    );
  }

  return (
    <Badge className={getStatusBadgeColor(status)}>
      {status}
    </Badge>
  );
}