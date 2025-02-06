import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { useUserRole } from "@/hooks/use-user-role";
import debounce from "lodash/debounce";

interface MaintenanceCostsTabProps {
  request: MaintenanceRequest;
  onUpdateRequest: (updates: Partial<MaintenanceRequest>) => void;
}

export function MaintenanceCostsTab({ request, onUpdateRequest }: MaintenanceCostsTabProps) {
  const { userRole } = useUserRole();
  const canEdit = userRole === 'service_provider' || userRole === 'landlord';

  // Local state to manage input values
  const [localValues, setLocalValues] = useState({
    service_provider_fee: request.service_provider_fee || 0,
    materials_cost: request.materials_cost || 0,
    cost_estimate: request.cost_estimate || 0,
    payment_amount: request.payment_amount || 0,
    cost_estimate_notes: request.cost_estimate_notes || ''
  });

  // Update local state when request prop changes
  useEffect(() => {
    setLocalValues({
      service_provider_fee: request.service_provider_fee || 0,
      materials_cost: request.materials_cost || 0,
      cost_estimate: request.cost_estimate || 0,
      payment_amount: request.payment_amount || 0,
      cost_estimate_notes: request.cost_estimate_notes || ''
    });
  }, [request]);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((field: string, value: number | string) => {
      console.log("Sending update to Supabase:", { field, value });
      onUpdateRequest({ [field]: value });
    }, 1000),
    [onUpdateRequest]
  );

  const handleInputChange = (field: keyof typeof localValues, value: string | number) => {
    let newValue: number | string = value;
    
    // Handle numeric fields
    if (field !== 'cost_estimate_notes') {
      // Allow empty string or partial input while typing
      if (value === '') {
        newValue = 0;
      } else {
        // Convert to number and handle invalid inputs
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        newValue = isNaN(numValue) ? 0 : numValue;
      }
    }

    // Update local state immediately
    setLocalValues(prev => ({ ...prev, [field]: value }));
    
    // Debounce the update to Supabase
    debouncedUpdate(field, newValue);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Service Provider Fee</Label>
        <Input
          type="number"
          value={localValues.service_provider_fee}
          onChange={(e) => handleInputChange('service_provider_fee', e.target.value)}
          className="bg-white"
          disabled={!canEdit}
          min="0"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <Label>Materials Cost</Label>
        <Input
          type="number"
          value={localValues.materials_cost}
          onChange={(e) => handleInputChange('materials_cost', e.target.value)}
          className="bg-white"
          disabled={!canEdit}
          min="0"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <Label>Estimated Cost</Label>
        <Input
          type="number"
          value={localValues.cost_estimate}
          onChange={(e) => handleInputChange('cost_estimate', e.target.value)}
          className="bg-white"
          disabled={!canEdit}
          min="0"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <Label>Final Cost</Label>
        <Input
          type="number"
          value={localValues.payment_amount}
          onChange={(e) => handleInputChange('payment_amount', e.target.value)}
          className="bg-white"
          disabled={!canEdit}
          min="0"
          step="0.01"
        />
      </div>

      <div className="space-y-2">
        <Label>Cost Notes</Label>
        <Textarea
          value={localValues.cost_estimate_notes}
          onChange={(e) => handleInputChange('cost_estimate_notes', e.target.value)}
          className="bg-white min-h-[100px]"
          placeholder="Add any notes about costs here..."
          disabled={!canEdit}
        />
      </div>
    </div>
  );
}