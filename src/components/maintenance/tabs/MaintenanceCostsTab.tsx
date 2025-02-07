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
  const [localData, setLocalData] = React.useState({
    service_provider_fee: request.service_provider_fee || 0,
    materials_cost: request.materials_cost || 0,
    cost_estimate: request.cost_estimate || 0,
    payment_amount: request.payment_amount || 0,
    cost_estimate_notes: request.cost_estimate_notes || ''
  });

  const handleChange = (field: string, value: number | string) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));
    // We're not calling onUpdateRequest here anymore
    console.log('Field updated locally:', { field, value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Service Provider Fee</Label>
        <Input
          type="number"
          value={localData.service_provider_fee}
          onChange={(e) => handleChange('service_provider_fee', parseFloat(e.target.value))}
          className="bg-white"
          disabled={!isServiceProvider}
        />
      </div>

      <div className="space-y-2">
        <Label>Materials Cost</Label>
        <Input
          type="number"
          value={localData.materials_cost}
          onChange={(e) => handleChange('materials_cost', parseFloat(e.target.value))}
          className="bg-white"
          disabled={!isServiceProvider}
        />
      </div>

      <div className="space-y-2">
        <Label>Estimated Cost</Label>
        <Input
          type="number"
          value={localData.cost_estimate}
          onChange={(e) => handleChange('cost_estimate', parseFloat(e.target.value))}
          className="bg-white"
          disabled={!isServiceProvider}
        />
      </div>

      <div className="space-y-2">
        <Label>Final Cost</Label>
        <Input
          type="number"
          value={localData.payment_amount}
          onChange={(e) => handleChange('payment_amount', parseFloat(e.target.value))}
          className="bg-white"
          disabled={!isServiceProvider}
        />
      </div>

      <div className="space-y-2">
        <Label>Cost Notes</Label>
        <Textarea
          value={localData.cost_estimate_notes}
          onChange={(e) => handleChange('cost_estimate_notes', e.target.value)}
          className="bg-white min-h-[100px]"
          placeholder="Add any notes about costs here..."
          disabled={!isServiceProvider}
        />
      </div>
    </div>
  );
}