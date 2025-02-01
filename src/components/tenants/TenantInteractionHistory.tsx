import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TenantInteractionHistoryProps {
  tenantId: string;
}

interface Observation {
  id: string;
  observation: string;
  created_at: string;
  landlord: {
    first_name: string;
    last_name: string;
  } | null;
}

export function TenantInteractionHistory({ tenantId }: TenantInteractionHistoryProps) {
  const { data: observations = [], isLoading: isLoadingObservations } = useQuery({
    queryKey: ["tenant-observations", tenantId],
    queryFn: async () => {
      console.log("Fetching observations for tenant:", tenantId);
      const { data, error } = await supabase
        .from("tenant_observations")
        .select(`
          *,
          landlord:profiles(first_name, last_name)
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching observations:", error);
        throw error;
      }
      console.log("Fetched observations:", data);
      return data as Observation[];
    },
  });

  if (isLoadingObservations) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const groupObservationsByMonth = (observations: Observation[]) => {
    const groups: { [key: string]: Observation[] } = {};
    
    observations.forEach((observation) => {
      const date = new Date(observation.created_at);
      const monthYear = format(date, "MMMM yyyy");
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(observation);
    });
    
    return groups;
  };

  const groupedObservations = groupObservationsByMonth(observations);

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="observations">
          <AccordionTrigger className="text-lg font-semibold">
            Observation History ({observations.length})
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-[400px] pr-4">
              {Object.entries(groupedObservations).map(([monthYear, monthObservations]) => (
                <div key={monthYear} className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3 sticky top-0 bg-white py-2">
                    {monthYear}
                  </h3>
                  <div className="space-y-4">
                    {monthObservations.map((observation) => (
                      <div
                        key={observation.id}
                        className="border border-gray-200 p-4 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">
                            {observation.landlord ? 
                              `${observation.landlord.first_name} ${observation.landlord.last_name}` : 
                              "Unknown Landlord"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(observation.created_at), "PPp")}
                          </p>
                        </div>
                        <p className="text-gray-800">{observation.observation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {observations.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No observations recorded yet
                </p>
              )}
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}