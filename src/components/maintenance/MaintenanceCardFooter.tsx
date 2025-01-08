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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex flex-col gap-1 text-sm">
        <span className="text-gray-500">
          {t('maintenance.details.createdOn')} {format(new Date(request.created_at), "MMM d, yyyy")}
        </span>
        <span className="text-gray-500">
          {t('maintenance.details.requestedBy')}: {request.tenant?.first_name} {request.tenant?.last_name}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {request.images && request.images.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onImageClick}
            className="hover:bg-gray-50"
          >
            <ImageIcon className="w-4 h-4 mr-1" />
            {t('maintenance.details.viewImages')}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onHistoryClick}
          className="hover:bg-gray-50"
        >
          <History className="w-4 h-4 mr-1" />
          {t('maintenance.details.viewHistory')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onEditClick}
          className="hover:bg-gray-50"
        >
          <Pencil className="w-4 h-4 mr-1" />
          {t('maintenance.details.edit')}
        </Button>
      </div>
    </div>
  );
}