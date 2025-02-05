import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Clock } from "lucide-react";
import { useState } from "react";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { Card } from "@/components/ui/card";
import { useCurrency } from "@/hooks/useCurrency";

interface MaintenanceCostsTabProps {
  request: MaintenanceRequest;
  onUpdate: (data: Partial<MaintenanceRequest>) => void;
}

export function MaintenanceCostsTab({ request, onUpdate }: MaintenanceCostsTabProps) {
  const { formatAmount } = useCurrency();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Cost Estimates</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="cost_estimate">Initial Cost Estimate</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="cost_estimate"
                type="number"
                value={request.cost_estimate || ""}
                onChange={(e) =>
                  onUpdate({ cost_estimate: parseFloat(e.target.value) || 0 })
                }
                placeholder="Enter cost estimate..."
                className="max-w-[200px]"
              />
              <span className="text-sm text-muted-foreground">
                {request.cost_estimate ? formatAmount(request.cost_estimate) : ''}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="service_provider_fee">Service Provider Fee</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="service_provider_fee"
                type="number"
                value={request.service_provider_fee || ""}
                onChange={(e) =>
                  onUpdate({ service_provider_fee: parseFloat(e.target.value) || 0 })
                }
                placeholder="Enter service fee..."
                className="max-w-[200px]"
              />
              <span className="text-sm text-muted-foreground">
                {request.service_provider_fee ? formatAmount(request.service_provider_fee) : ''}
              </span>
            </div>
          </div>

          {(request.cost_estimate || request.service_provider_fee) && (
            <div className="pt-2">
              <Label>Total Estimated Cost</Label>
              <p className="text-lg font-semibold text-primary">
                {formatAmount((request.cost_estimate || 0) + (request.service_provider_fee || 0))}
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Payment Timeline</h3>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Status:</span>
            <span className="font-medium capitalize">{request.payment_status || 'Pending'}</span>
          </div>
          
          {request.payment_amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Amount:</span>
              <span className="font-medium">{formatAmount(request.payment_amount)}</span>
            </div>
          )}

          {request.completion_date && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completion Date:</span>
              <span className="font-medium">
                {new Date(request.completion_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}