import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MaintenanceRequest, MaintenanceRequestStatus } from "@/types/maintenance";
import { useState } from "react";
import { MaintenanceDialog } from "./MaintenanceDialog";
import { MaintenanceHistoryDialog } from "./MaintenanceHistoryDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { MaintenanceCardHeader } from "./MaintenanceCardHeader";
import { MaintenanceCardContent } from "./MaintenanceCardContent";
import { MaintenanceCardFooter } from "./MaintenanceCardFooter";

interface MaintenanceRequestCardProps {
  request: MaintenanceRequest;
  isLandlord?: boolean;
}

export function MaintenanceRequestCard({ request, isLandlord }: MaintenanceRequestCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusChange = async (newStatus: MaintenanceRequestStatus) => {
    try {
      const { error } = await supabase
        .from("maintenance_requests")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", request.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <MaintenanceCardHeader 
            request={request} 
            isLandlord={isLandlord} 
            onStatusChange={handleStatusChange} 
          />
        </CardHeader>
        <CardContent>
          <MaintenanceCardContent 
            request={request} 
            onImageClick={() => setIsImageDialogOpen(true)} 
          />
        </CardContent>
        <CardFooter>
          <MaintenanceCardFooter 
            request={request}
            onImageClick={() => setIsImageDialogOpen(true)}
            onHistoryClick={() => setIsHistoryDialogOpen(true)}
            onEditClick={() => setIsEditDialogOpen(true)}
          />
        </CardFooter>
      </Card>

      <MaintenanceDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        request={request}
      />
      
      <MaintenanceHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        request={request}
      />
    </>
  );
}