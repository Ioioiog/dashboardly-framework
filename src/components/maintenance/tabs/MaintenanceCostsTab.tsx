import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceCostsTabProps {
  request: MaintenanceRequest;
  onUpdateRequest: (updates: Partial<MaintenanceRequest>) => void;
}

export function MaintenanceCostsTab({ request, onUpdateRequest }: MaintenanceCostsTabProps) {
  const { userRole } = useUserRole();
  const { toast } = useToast();
  const isServiceProvider = userRole === 'service_provider';
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateCosts = async () => {
    if (!isServiceProvider) return;

    try {
      setIsUpdating(true);

      const { error } = await supabase
        .from('maintenance_requests')
        .update({
          service_provider_fee: request.service_provider_fee || 0,
          materials_cost: request.materials_cost || 0,
          cost_estimate: request.cost_estimate || 0,
          payment_amount: request.payment_amount || 0,
          cost_estimate_notes: request.cost_estimate_notes || ''
        })
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Cost information has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error updating costs:', error);
      toast({
        title: "Error",
        description: "Failed to update cost information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {{ ... }}
      <div className="space-y-2">
        <Label>Service Provider Fee</Label>
        <Input
          type="number"
          value={request.service_provider_fee || 0}
          onChange={(e) => onUpdateRequest({ service_provider_fee: parseFloat(e.target.value) })}
          className="bg-white"
          disabled={!isServiceProvider}
        />
      </div>

      <div className="space-y-2">
        <Label>Materials Cost</Label>
        <Input
          type="number"
          value={request.materials_cost || 0}
          onChange={(e) => onUpdateRequest({ materials_cost: parseFloat(e.target.value) })}
          className="bg-white"
          disabled={!isServiceProvider}
        />
      </div>

      <div className="space-y-2">
        <Label>Estimated Cost</Label>
        <Input
          type="number"
          value={request.cost_estimate || 0}
          onChange={(e) => onUpdateRequest({ cost_estimate: parseFloat(e.target.value) })}
          className="bg-white"
          disabled={!isServiceProvider}
        />
      </div>

      <div className="space-y-2">
        <Label>Final Cost</Label>
        <Input
          type="number"
          value={request.payment_amount || 0}
          onChange={(e) => onUpdateRequest({ payment_amount: parseFloat(e.target.value) })}
          className="bg-white"
          disabled={!isServiceProvider}
        />
      </div>

      <div className="space-y-2">
        <Label>Cost Notes</Label>
        <Textarea
          value={request.cost_estimate_notes || ''}
          onChange={(e) => onUpdateRequest({ cost_estimate_notes: e.target.value })}
          className="bg-white min-h-[100px]"
          placeholder="Add any notes about costs here..."
          disabled={!isServiceProvider}
        />
      </div>

      {isServiceProvider && (
        <div className="pt-4">
          <Button
            onClick={handleUpdateCosts}
            disabled={isUpdating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isUpdating ? "Updating..." : "Update All Costs"}
          </Button>
        </div>
      )}
    </div>
  );
}
