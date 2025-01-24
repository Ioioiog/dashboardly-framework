import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, DollarSign } from "lucide-react";

interface UtilityStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyName: string;
}

interface UtilityStats {
  average_monthly_cost: number;
  total_utilities: number;
  highest_bill: number;
  lowest_bill: number;
}

export function UtilityStatsDialog({
  open,
  onOpenChange,
  propertyId,
  propertyName,
}: UtilityStatsDialogProps) {
  const { data: stats, isLoading } = useQuery<UtilityStats>({
    queryKey: ["utilityStats", propertyId],
    queryFn: async () => {
      console.log("Fetching utility stats for property:", propertyId);
      const { data, error } = await supabase
        .rpc('get_property_utility_stats', {
          property_id: propertyId
        });

      if (error) {
        console.error("Error fetching utility stats:", error);
        throw error;
      }

      console.log("Utility stats:", data);
      return data as UtilityStats;
    },
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Utility Statistics for {propertyName}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Average Monthly Cost</p>
                <p className="text-2xl font-bold">${stats.average_monthly_cost}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-50" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Highest Bill</p>
                <p className="text-xl font-semibold">${stats.highest_bill}</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Lowest Bill</p>
                <p className="text-xl font-semibold">${stats.lowest_bill}</p>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Utilities Recorded</p>
              <p className="text-xl font-semibold">{stats.total_utilities}</p>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            No utility data available for this property.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}