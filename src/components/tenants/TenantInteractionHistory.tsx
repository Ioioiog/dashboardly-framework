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

interface TenantInteractionHistoryProps {
  tenantId: string;
}

interface Observation {
  id: string;
  observation: string;
  created_at: string;
}

export function TenantInteractionHistory({ tenantId }: TenantInteractionHistoryProps) {
  const { data: observations = [], isLoading: isLoadingObservations } = useQuery({
    queryKey: ["tenant-observations", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_observations")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Observation[];
    },
  });

  if (isLoadingObservations) {
    return <div>Loading history...</div>;
  }

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="observations">
          <AccordionTrigger>Observations ({observations.length})</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {observations.map((observation) => (
                <div key={observation.id} className="border p-3 rounded-lg">
                  <p className="text-sm text-gray-500">
                    {format(new Date(observation.created_at), "PPp")}
                  </p>
                  <p className="mt-1">{observation.observation}</p>
                </div>
              ))}
              {observations.length === 0 && (
                <p className="text-sm text-gray-500">No observations yet</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}