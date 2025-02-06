import React from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, Wrench, FileText, User, Calendar } from "lucide-react";

interface TimelineEvent {
  status: string;
  date: string;
  icon: React.ReactNode;
  description: string;
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
        status: "report_submitted",
        date: createdAt,
        icon: <FileText className="h-5 w-5 text-blue-500" />,
        description: "Maintenance request created with details and photos"
      },
      {
        status: "landlord_review",
        date: createdAt,
        icon: <User className="h-5 w-5 text-purple-500" />,
        description: "Request under review by property manager"
      },
      {
        status: "provider_assigned",
        date: updatedAt,
        icon: <Wrench className="h-5 w-5 text-orange-500" />,
        description: "Service provider selected and notified"
      },
      {
        status: "scheduled",
        date: updatedAt,
        icon: <Calendar className="h-5 w-5 text-indigo-500" />,
        description: "Service date and time confirmed"
      },
      {
        status: "in_progress",
        date: updatedAt,
        icon: <Clock className="h-5 w-5 text-yellow-500" />,
        description: "Work being performed"
      },
      {
        status: "completed",
        date: updatedAt,
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        description: "Work finished and verified"
      }
    ];

    return events;
  };

  const getStatusVariant = (eventStatus: string) => {
    if (status === eventStatus) return "default";
    if (status === "completed") return "default";
    
    const statusOrder = [
      "report_submitted",
      "landlord_review",
      "provider_assigned",
      "scheduled",
      "in_progress",
      "completed"
    ];
    
    const currentIndex = statusOrder.indexOf(status);
    const eventIndex = statusOrder.indexOf(eventStatus);
    
    if (eventIndex < currentIndex) return "default";
    return "secondary";
  };

  return (
    <div className="space-y-6 py-4">
      {getTimelineEvents().map((event, index) => (
        <div key={event.status} className="flex items-start space-x-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-background 
            ${status === event.status ? 'ring-2 ring-primary' : ''}`}>
            {event.icon}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium leading-none">
                  {t(`maintenance.timeline.${event.status}`)}
                </h4>
                <Badge variant={getStatusVariant(event.status)}>
                  {status === event.status ? "Current" : "Pending"}
                </Badge>
              </div>
              <time className="text-sm text-muted-foreground">
                {format(new Date(event.date), "PPp")}
              </time>
            </div>
            <p className="text-sm text-muted-foreground">
              {event.description}
            </p>
            {index < getTimelineEvents().length - 1 && (
              <div className="pt-4">
                <div className="h-[2px] w-full bg-border" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}