import { useTranslation } from "react-i18next";
import { MaintenanceRequest } from "@/types/maintenance";

interface MaintenanceCardContentProps {
  request: MaintenanceRequest;
  onImageClick: () => void;
}

export function MaintenanceCardContent({ request, onImageClick }: MaintenanceCardContentProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
      {request.notes && (
        <div className="p-2 bg-accent/50 rounded-md">
          <p className="text-sm text-muted-foreground">{request.notes}</p>
        </div>
      )}
      {request.images && request.images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {request.images.slice(0, 4).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={t('maintenance.details.imageAlt', { number: index + 1 })}
              className="h-16 w-16 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
              onClick={onImageClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}