import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";

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
    setIsSubmitting(true);

    try {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error("No authenticated user");

      const { error } = await supabase
        .from('tenant_observations')
        .insert({
          tenant_id: tenantId,
          landlord_id: profile.user.id,
          observation: observation,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Observation added successfully",
      });

      setOpen(false);
      setObservation("");
    } catch (error) {
      console.error("Error adding observation:", error);
      toast({
        title: "Error",
        description: "Failed to add observation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Add Observation</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Observation for {tenantName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Enter your observation..."
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            required
            className="min-h-[100px]"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Observation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}