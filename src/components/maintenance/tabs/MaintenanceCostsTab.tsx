import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Clock, Calculator, Receipt, AlertCircle } from "lucide-react";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { Card } from "@/components/ui/card";
import { useCurrency } from "@/hooks/useCurrency";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface MaintenanceCostsTabProps {
  request: MaintenanceRequest;
  onUpdate: (data: Partial<MaintenanceRequest>) => void;
}

export function MaintenanceCostsTab({ request, onUpdate }: MaintenanceCostsTabProps) {
  const { formatAmount } = useCurrency();

  const getCostStatus = () => {
    if (!request.cost_estimate) return 'pending';
    if (request.cost_estimate_status === 'approved') return 'approved';
    if (request.cost_estimate_status === 'rejected') return 'rejected';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Cost Breakdown</h3>
          {getCostStatus() && (
            <Badge className={`ml-auto ${getStatusColor(getCostStatus())}`}>
              {getCostStatus().charAt(0).toUpperCase() + getCostStatus().slice(1)}
            </Badge>
          )}
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
            <Label htmlFor="cost_estimate_notes">Estimate Notes</Label>
            <Textarea
              id="cost_estimate_notes"
              value={request.cost_estimate_notes || ""}
              onChange={(e) => onUpdate({ cost_estimate_notes: e.target.value })}
              placeholder="Add notes about the cost estimate..."
              className="h-20"
            />
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
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <Label>Total Estimated Cost</Label>
                <p className="text-lg font-semibold text-primary">
                  {formatAmount((request.cost_estimate || 0) + (request.service_provider_fee || 0))}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Payment Details</h3>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm border-b pb-2">
            <span className="text-muted-foreground">Payment Status:</span>
            <Badge variant="outline">
              {request.payment_status?.toUpperCase() || 'PENDING'}
            </Badge>
          </div>
          
          {request.payment_amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Final Payment Amount:</span>
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

      {request.approval_status && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Approval Status</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="outline">
                {request.approval_status.toUpperCase()}
              </Badge>
            </div>
            
            {request.approval_notes && (
              <div className="mt-2">
                <Label>Approval Notes</Label>
                <p className="text-sm text-muted-foreground mt-1">{request.approval_notes}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}