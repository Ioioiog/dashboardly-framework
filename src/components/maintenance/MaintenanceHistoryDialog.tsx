import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { MaintenanceRequest } from "@/types/maintenance";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon } from "lucide-react";

interface MaintenanceHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: MaintenanceRequest;
}

interface HistoryEntry {
  id: string;
  title: string;
  description: string;
  issue_type: string | null;
  priority: string | null;
  notes: string | null;
  images: string[] | null;
  edited_at: string;
}

export function MaintenanceHistoryDialog({
  open,
  onOpenChange,
  request,
}: MaintenanceHistoryDialogProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ["maintenance-history", request.id],
    queryFn: async () => {
      console.log("Fetching maintenance history for request:", request.id);
      const { data, error } = await supabase
        .from("maintenance_request_history")
        .select("*")
        .eq("maintenance_request_id", request.id)
        .order("edited_at", { ascending: false });

      if (error) {
        console.error("Error fetching maintenance history:", error);
        throw error;
      }

      console.log("Fetched maintenance history:", data);
      return data as HistoryEntry[];
    },
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="history-dialog-description">
        <DialogHeader>
          <DialogTitle>Edit History</DialogTitle>
          <DialogDescription id="history-dialog-description">
            View the complete history of changes made to this maintenance request, including updates to status, priority, and notes.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {history?.map((entry) => (
                <div key={entry.id} className="border-b pb-4">
                  <div className="text-sm text-gray-500 mb-2">
                    Edited on {format(new Date(entry.edited_at), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">Title:</span> {entry.title}
                    </div>
                    <div>
                      <span className="font-semibold">Description:</span>{" "}
                      {entry.description}
                    </div>
                    {entry.issue_type && (
                      <div>
                        <span className="font-semibold">Issue Type:</span>{" "}
                        {entry.issue_type}
                      </div>
                    )}
                    {entry.priority && (
                      <div>
                        <span className="font-semibold">Priority:</span>{" "}
                        {entry.priority}
                      </div>
                    )}
                    {entry.notes && (
                      <div>
                        <span className="font-semibold">Notes:</span> {entry.notes}
                      </div>
                    )}
                    {entry.images && entry.images.length > 0 && (
                      <div>
                        <span className="font-semibold">Images:</span>{" "}
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <ImageIcon className="w-4 h-4" />
                          {entry.images.length} image{entry.images.length !== 1 ? 's' : ''} attached
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {!history?.length && (
                <div className="text-center text-gray-500">
                  No edit history available
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}