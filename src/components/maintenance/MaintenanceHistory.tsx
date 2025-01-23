import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceHistoryProps {
  requestId: string;
}

export function MaintenanceHistory({ requestId }: MaintenanceHistoryProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['maintenance-history', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_request_history')
        .select(`
          *,
          editor:profiles!maintenance_request_history_edited_by_fkey(
            first_name,
            last_name
          )
        `)
        .eq('maintenance_request_id', requestId)
        .order('edited_at', { ascending: false });

      if (error) throw error;
      return data;
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
                  by {entry.editor?.first_name} {entry.editor?.last_name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}