import { useTranslation } from "react-i18next";
import { MaintenanceRequest } from "@/types/maintenance";

interface MaintenanceCardContentProps {
  request: MaintenanceRequest;
  onImageClick: () => void;
}

export function MaintenanceCardContent({ request, onImageClick }: MaintenanceCardContentProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p className="text-gray-600">{request.description}</p>
      {request.notes && (
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">{request.notes}</p>
        </div>
      )}
      {request.images && request.images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {request.images.slice(0, 4).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={t('maintenance.details.imageAlt', { number: index + 1 })}
              className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={onImageClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}