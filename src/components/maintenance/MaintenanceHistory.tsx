import React from "react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface MaintenanceHistoryProps {
  requestId: string;
}

interface HistoryEntry {
  id: string;
  maintenance_request_id: string;
  title: string;
  description: string;
  notes: string | null;
  edited_at: string;
  editor: {
    first_name: string | null;
    last_name: string | null;
  } | null;
  images: string[] | null;
  issue_type: string | null;
  priority: string | null;
  edited_by: string;
}

export function MaintenanceHistory({ requestId }: MaintenanceHistoryProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['maintenance-history', requestId],
    queryFn: async () => {
      console.log('Fetching maintenance history for request:', requestId);
      
      // First get the history entries
      const { data: historyData, error: historyError } = await supabase
        .from('maintenance_request_history')
        .select('*')
        .eq('maintenance_request_id', requestId)
        .order('edited_at', { ascending: false });

      if (historyError) {
        console.error('Error fetching maintenance history:', historyError);
        throw historyError;
      }

      // For each history entry, get the editor's profile
      const historyWithProfiles = await Promise.all(
        (historyData || []).map(async (entry) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', entry.edited_by)
            .maybeSingle();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
          }

          return {
            ...entry,
            editor: profileData || null
          };
        })
      );
      
      console.log('Fetched maintenance history:', historyWithProfiles);
      return historyWithProfiles as HistoryEntry[];
    },
  });

  if (isLoading) {
    return <div>Loading history...</div>;
  }

  if (!history?.length) {
    return <div>No history available</div>;
  }

  return (
    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {history.map((entry) => (
          <div key={entry.id} className="border-b pb-2 last:border-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{entry.title}</p>
                <p className="text-sm text-gray-500">{entry.description}</p>
                {entry.notes && (
                  <p className="text-sm mt-1 text-gray-600">{entry.notes}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {format(new Date(entry.edited_at), 'PPp')}
                </p>
                <p className="text-xs text-gray-400">
                  by {entry.editor?.first_name || ''} {entry.editor?.last_name || ''}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}