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
    <div className="space-y-2">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate">{request.title}</h3>
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
              <SelectTrigger className="w-[140px]">
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
      <div className="flex flex-wrap gap-2">
        {request.issue_type && (
          <Badge variant="outline" className="flex items-center gap-1">
            <PriorityIcon priority={request.priority} />
            {request.issue_type}
          </Badge>
        )}
        {request.priority && (
          <Badge variant="outline" className="capitalize">
            {t(`maintenance.priority.${request.priority.toLowerCase()}`)}
          </Badge>
        )}
      </div>
    </div>
  );
}