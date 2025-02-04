import React from "react";
import { Card } from "@/components/ui/card";
import { MaintenanceCard } from "./MaintenanceCard";
import { NoDataCard } from "@/components/dashboard/charts/NoDataCard";

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

interface MaintenanceSectionProps {
  title: string;
  description: string;
  requests: MaintenanceRequest[];
  onRequestClick: (id: string) => void;
}

export function MaintenanceSection({
  title,
  description,
  requests,
  onRequestClick,
}: MaintenanceSectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-500 text-sm mb-4">{description}</p>
      
      <div className="space-y-4">
        {requests.length > 0 ? (
          requests.map((request) => (
            <MaintenanceCard
              key={request.id}
              request={request}
              onClick={onRequestClick}
            />
          ))
        ) : (
          <NoDataCard 
            title={title}
            message="No maintenance requests found"
          />
        )}
      </div>
    </Card>
  );
}