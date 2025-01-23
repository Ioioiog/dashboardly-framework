import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MaintenanceRequest, MaintenanceRequestStatus } from "@/types/maintenance";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { MaintenanceCardHeader } from "./MaintenanceCardHeader";
import { MaintenanceCardContent } from "./MaintenanceCardContent";
import { MaintenanceCardFooter } from "./MaintenanceCardFooter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface MaintenanceRequestCardProps {
  request: MaintenanceRequest;
  isLandlord?: boolean;
}

export function MaintenanceRequestCard({ request, isLandlord }: MaintenanceRequestCardProps) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusChange = async (newStatus: MaintenanceRequestStatus) => {
    try {
      console.log('Updating maintenance request status:', { requestId: request.id, newStatus });
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

  const handleNextImage = () => {
    if (request.images && currentImageIndex < request.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  return (
    <>
      <Card className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
        <MaintenanceCardHeader 
          request={request} 
          isLandlord={isLandlord} 
          onStatusChange={handleStatusChange} 
        />
        <CardContent className="p-3 pt-0">
          <MaintenanceCardContent 
            request={request} 
            onImageClick={() => setIsImageDialogOpen(true)} 
          />
        </CardContent>
        <CardFooter className="p-3 pt-0">
          <MaintenanceCardFooter 
            request={request}
            onImageClick={() => setIsImageDialogOpen(true)}
          />
        </CardFooter>
      </Card>

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
              onClick={() => setIsImageDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            {request.images && request.images.length > 0 && (
              <div className="relative">
                <img
                  src={request.images[currentImageIndex]}
                  alt={`Maintenance request image ${currentImageIndex + 1}`}
                  className="w-full rounded-lg"
                />
                {request.images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handlePreviousImage}
                      disabled={currentImageIndex === 0}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-2 bg-black/50 text-white rounded">
                      {currentImageIndex + 1} / {request.images.length}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleNextImage}
                      disabled={currentImageIndex === request.images.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}