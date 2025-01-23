import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye } from "lucide-react";

interface TenantObservationDialogProps {
  tenantId: string;
  tenantName: string;
}

export function TenantObservationDialog({ tenantId, tenantName }: TenantObservationDialogProps) {
  const [open, setOpen] = useState(false);
  const [observation, setObservation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
      
      setOpen(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="icon" onClick={() => setOpen(true)}>
        <Eye className="h-4 w-4" />
        <span className="sr-only">Add observation</span>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tenant Observation</DialogTitle>
          <DialogDescription>
            Record an observation about {tenantName}. This will be visible only to landlords.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Enter your observation..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !observation.trim()}>
              {isSubmitting ? "Saving..." : "Save Observation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}