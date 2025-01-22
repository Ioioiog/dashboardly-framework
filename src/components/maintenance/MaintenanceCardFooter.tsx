import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { MaintenanceRequest } from "@/types/maintenance";
import { format } from "date-fns";
import { History, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface MaintenanceCardFooterProps {
  request: MaintenanceRequest;
  onImageClick: () => void;
  onHistoryClick: () => void;
  onEditClick: () => void;
}

export function MaintenanceCardFooter({ request, onImageClick, onHistoryClick, onEditClick }: MaintenanceCardFooterProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("maintenance_requests")
        .delete()
        .eq("id", request.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      toast({
        title: "Success",
        description: "Maintenance request deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting maintenance request:", error);
      toast({
        title: "Error",
        description: "Failed to delete maintenance request",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="px-4 py-2 border-t bg-gray-50/50 flex flex-wrap items-center justify-between gap-2">
      <div className="text-xs text-muted-foreground">
        <span className="inline-block mr-4">
          {format(new Date(request.created_at), "MMM d, yyyy")}
        </span>
        <span>
          {request.tenant?.first_name} {request.tenant?.last_name}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {request.images && request.images.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onImageClick}
            className="h-7 text-xs"
          >
            <ImageIcon className="w-3 h-3 mr-1" />
            {t('maintenance.details.viewImages')}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onHistoryClick}
          className="h-7 text-xs"
        >
          <History className="w-3 h-3 mr-1" />
          {t('maintenance.details.viewHistory')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEditClick}
          className="h-7 text-xs"
        >
          <Pencil className="w-3 h-3 mr-1" />
          {t('maintenance.details.edit')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          {t('maintenance.details.delete')}
        </Button>
      </div>
    </div>
  );
}