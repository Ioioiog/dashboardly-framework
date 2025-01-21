import { useTranslation } from "react-i18next";
import { MaintenanceRequest } from "@/types/maintenance";

interface MaintenanceCardContentProps {
  request: MaintenanceRequest;
  onImageClick: () => void;
}

export function MaintenanceCardContent({ request, onImageClick }: MaintenanceCardContentProps) {
  const { t } = useTranslation();

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-[#D3E4FD]';
      case 'pending':
        return 'bg-[#FEF7CD]';
      case 'completed':
        return 'bg-[#F2FCE2]';
      case 'cancelled':
        return 'bg-[#F1F0FB]';
      default:
        return '';
    }
  };

  return (
    <div className={`px-4 pb-2 ${getStatusBackgroundColor(request.status)}`}>
      <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
      {request.notes && (
        <div className="mt-2 p-2 bg-accent/30 rounded-md">
          <p className="text-sm text-muted-foreground">{request.notes}</p>
        </div>
      )}
      {request.images && request.images.length > 0 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
          {request.images.slice(0, 4).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={t('maintenance.details.imageAlt', { number: index + 1 })}
              className="h-14 w-14 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity flex-shrink-0"
              onClick={onImageClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}