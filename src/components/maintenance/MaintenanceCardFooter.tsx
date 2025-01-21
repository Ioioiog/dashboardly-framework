import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { MaintenanceRequest } from "@/types/maintenance";
import { format } from "date-fns";
import { History, ImageIcon, Pencil } from "lucide-react";

interface MaintenanceCardFooterProps {
  request: MaintenanceRequest;
  onImageClick: () => void;
  onHistoryClick: () => void;
  onEditClick: () => void;
}

export function MaintenanceCardFooter({ request, onImageClick, onHistoryClick, onEditClick }: MaintenanceCardFooterProps) {
  const { t } = useTranslation();

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
      </div>
    </div>
  );
}