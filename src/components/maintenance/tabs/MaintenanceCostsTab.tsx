import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { useUserRole } from "@/hooks/use-user-role";

interface MaintenanceCostsTabProps {
  request: MaintenanceRequest;
  onUpdateRequest: (updates: Partial<MaintenanceRequest>) => void;
}

export function MaintenanceCostsTab({ request, onUpdateRequest }: MaintenanceCostsTabProps) {
  const { userRole } = useUserRole();
  const isServiceProvider = userRole === 'service_provider';

  return (
    <div className="space-y-4">
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
    </div>
  );
}