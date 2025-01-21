import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { MaintenanceRequest } from "@/types/maintenance";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_COLORS, STATUS_OPTIONS } from "./constants";
import { PriorityIcon } from "./PriorityIcon";

interface MaintenanceCardHeaderProps {
  request: MaintenanceRequest;
  isLandlord?: boolean;
  onStatusChange: (status: string) => void;
}

export function MaintenanceCardHeader({ request, isLandlord, onStatusChange }: MaintenanceCardHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 truncate">{request.title}</h3>
            {request.property && (
              <div className="text-sm text-muted-foreground truncate">
                {request.property.name}
                {request.property.address && (
                  <span className="text-muted-foreground/70 ml-1">({request.property.address})</span>
                )}
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            {isLandlord ? (
              <Select
                defaultValue={request.status}
                onValueChange={onStatusChange}
              >
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      <Badge className={STATUS_COLORS[status]}>
                        {t(`maintenance.status.${status.toLowerCase()}`)}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge className={STATUS_COLORS[request.status]}>
                {t(`maintenance.status.${request.status.toLowerCase()}`)}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {request.issue_type && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <PriorityIcon priority={request.priority} />
              {request.issue_type}
            </Badge>
          )}
          {request.priority && (
            <Badge variant="outline" className="capitalize text-xs">
              {t(`maintenance.priority.${request.priority.toLowerCase()}`)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}