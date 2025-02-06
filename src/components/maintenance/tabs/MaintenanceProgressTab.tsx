import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface MaintenanceProgressTabProps {
  request: MaintenanceRequest;
  onUpdateRequest: (updates: Partial<MaintenanceRequest>) => void;
}

export function MaintenanceProgressTab({ request, onUpdateRequest }: MaintenanceProgressTabProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Request Progress</h3>
          <Badge variant="outline" className={getStatusColor(request.status)}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
            {getStatusIcon(request.status)}
            <div>
              <p className="font-medium">Current Status</p>
              <p className="text-sm text-gray-600">
                Last updated: {format(new Date(request.updated_at), 'PPp')}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="mb-2">Update Status</Label>
            <Select 
              value={request.status} 
              onValueChange={(value: "pending" | "in_progress" | "completed" | "cancelled") => 
                onUpdateRequest({ status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 mt-6">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${request.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <span className="text-sm">Request Submitted</span>
              <span className="text-xs text-gray-500 ml-auto">
                {format(new Date(request.created_at), 'PPp')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${request.status === 'in_progress' ? 'bg-blue-500' : request.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Work In Progress</span>
              {request.status === 'in_progress' && (
                <span className="text-xs text-gray-500 ml-auto">Current Stage</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${request.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Request Completed</span>
              {request.status === 'completed' && request.completion_date && (
                <span className="text-xs text-gray-500 ml-auto">
                  {format(new Date(request.completion_date), 'PPp')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}