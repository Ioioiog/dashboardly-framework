import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardEdit } from "lucide-react";
import { format } from "date-fns";
import { TenantInteractionHistory } from "./TenantInteractionHistory";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TenantObservationDialogProps {
  tenantId: string;
  tenantName: string;
}

export function TenantObservationDialog({ tenantId, tenantName }: TenantObservationDialogProps) {
  const [open, setOpen] = useState(false);
  const [observation, setObservation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentObservations, setRecentObservations] = useState<Array<{
    id: string;
    observation: string;
    created_at: string;
  }>>([]);
  const { toast } = useToast();

  const fetchRecentObservations = async () => {
    try {
      const { data, error } = await supabase
        .from("tenant_observations")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentObservations(data || []);
    } catch (error) {
      console.error("Error fetching recent observations:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!observation.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { error } = await supabase
        .from("tenant_observations")
        .insert({
          tenant_id: tenantId,
          landlord_id: user.id,
          observation: observation.trim(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Observation recorded successfully.",
      });
      
      await fetchRecentObservations();
      setObservation("");
    } catch (error) {
      console.error("Error recording observation:", error);
      toast({
        title: "Error",
        description: "Failed to record observation.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      fetchRecentObservations();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setOpen(true)}
        className="hover:bg-blue-50"
      >
        <ClipboardEdit className="h-4 w-4 text-blue-600" />
        <span className="sr-only">Add observation</span>
      </Button>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Tenant Observation</DialogTitle>
          <DialogDescription className="text-gray-600">
            Record an observation about {tenantName}. This will be visible only to landlords.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Enter your observation..."
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    rows={4}
                    className="resize-none focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    Be specific and objective in your observations.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setOpen(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !observation.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? "Saving..." : "Save Observation"}
                  </Button>
                </div>
              </form>
            </div>

            {recentObservations.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Observations</h4>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-3">
                    {recentObservations.map((obs) => (
                      <div key={obs.id} className="bg-white p-3 rounded-lg border border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">
                          {format(new Date(obs.created_at), "PPp")}
                        </p>
                        <p className="text-sm">{obs.observation}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-gray-200 pt-6 lg:pt-0 lg:pl-8">
            <div className="bg-gray-50 rounded-lg p-4 h-full">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Full Observation History</h4>
              <TenantInteractionHistory tenantId={tenantId} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}