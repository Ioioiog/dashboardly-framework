import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardEdit } from "lucide-react";
import { format } from "date-fns";

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Tenant Observation</DialogTitle>
          <DialogDescription className="text-gray-600">
            Record an observation about {tenantName}. This will be visible only to landlords.
          </DialogDescription>
        </DialogHeader>
        
        {recentObservations.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Observations</h4>
            <div className="space-y-2">
              {recentObservations.map((obs) => (
                <div key={obs.id} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    {format(new Date(obs.created_at), "PPp")}
                  </p>
                  <p className="text-sm">{obs.observation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Enter your observation..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={4}
              className="resize-none"
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
      </DialogContent>
    </Dialog>
  );
}