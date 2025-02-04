import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  tenant: {
    first_name: string;
    last_name: string;
  };
  property: {
    name: string;
  };
}

interface MaintenanceCardProps {
  request: MaintenanceRequest;
  onClick: (id: string) => void;
}

export function MaintenanceCard({ request, onClick }: MaintenanceCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(request.id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold">{request.title}</h3>
          <p className="text-sm text-gray-500">
            {request.tenant.first_name} {request.tenant.last_name}
          </p>
        </div>
        <Badge className={getPriorityColor(request.priority)}>
          {request.priority}
        </Badge>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {request.description}
      </p>
      
      <div className="text-xs text-gray-500">
        <p>Property: {request.property.name}</p>
        <p>Created: {format(new Date(request.created_at), 'PPP')}</p>
      </div>
    </Card>
  );
}