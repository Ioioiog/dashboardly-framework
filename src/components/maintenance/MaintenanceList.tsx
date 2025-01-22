import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { MaintenanceRequest, MaintenanceRequestStatus, MaintenancePriority, MaintenanceIssueType } from "@/types/maintenance";
import { MaintenanceRequestCard } from "./MaintenanceRequestCard";
import { MaintenanceFilters } from "./MaintenanceFilters";
import { useState, useMemo } from "react";

interface MaintenanceListProps {
  requests: MaintenanceRequest[] | undefined;
  isLoading: boolean;
  isLandlord?: boolean;
}

export function MaintenanceList({ requests, isLoading, isLandlord }: MaintenanceListProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MaintenanceRequestStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | MaintenancePriority>("all");
  const [issueTypeFilter, setIssueTypeFilter] = useState<"all" | MaintenanceIssueType>("all");

  const filteredRequests = useMemo(() => {
    if (!requests) return [];

    return requests.filter((request) => {
      const matchesSearch = 
        searchTerm === "" ||
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.property?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.tenant?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.tenant?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
      const matchesIssueType = issueTypeFilter === "all" || request.issue_type === issueTypeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesIssueType;
    });
  }, [requests, searchTerm, statusFilter, priorityFilter, issueTypeFilter]);

  if (isLoading) {
    return (
      <div className="space-y-2 max-w-4xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!requests?.length) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="p-4">
          <div className="text-center text-gray-500">
            {t('maintenance.noRequests')}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <MaintenanceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        issueTypeFilter={issueTypeFilter}
        setIssueTypeFilter={setIssueTypeFilter}
      />
      <div className="space-y-2 mt-4">
        {filteredRequests.map((request) => (
          <div 
            key={request.id}
            className="bg-white hover:bg-gray-50 border rounded-lg transition-colors"
          >
            <MaintenanceRequestCard 
              request={request} 
              isLandlord={isLandlord}
            />
          </div>
        ))}
      </div>
    </div>
  );
}