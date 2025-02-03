import React from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, Wrench } from "lucide-react";

interface TimelineEvent {
  status: string;
  date: string;
  icon: React.ReactNode;
}

interface RequestStatusTimelineProps {
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function RequestStatusTimeline({ 
  status, 
  createdAt, 
  updatedAt 
}: RequestStatusTimelineProps) {
  const { t } = useTranslation();

  const getTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [
      {
        status: "pending",
        date: createdAt,
        icon: <Clock className="h-5 w-5 text-yellow-500" />
      }
    ];

    if (status === "in_progress") {
      events.push({
        status: "in_progress",
        date: updatedAt,
        icon: <Wrench className="h-5 w-5 text-blue-500" />
      });
    }

    if (status === "completed") {
      events.push({
        status: "completed",
        date: updatedAt,
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
      });
    }

    return events;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {getTimelineEvents().map((event, index) => (
          <React.Fragment key={event.status}>
            <div className="flex items-center space-x-2">
              {event.icon}
              <div className="flex flex-col">
                <Badge variant={status === event.status ? "default" : "outline"}>
                  {t(`maintenance.status.${event.status}`)}
                </Badge>
                <span className="text-xs text-gray-500 mt-1">
                  {format(new Date(event.date), "PPp")}
                </span>
              </div>
            </div>
            {index < getTimelineEvents().length - 1 && (
              <div className="h-0.5 flex-1 bg-gray-200" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}