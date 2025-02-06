import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Calendar, 
  Wrench, 
  FileText,
  User,
  DollarSign,
  ClipboardCheck,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { useUserRole } from "@/hooks/use-user-role";

interface MaintenanceProgressTabProps {
  request: MaintenanceRequest;
  onUpdateRequest: (updates: Partial<MaintenanceRequest>) => void;
}

export function MaintenanceProgressTab({ request, onUpdateRequest }: MaintenanceProgressTabProps) {
  const { userRole } = useUserRole();

  if (!request) {
    return <div>No request data available</div>;
  }

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

  const steps = [
    {
      label: "Request Submitted",
      icon: <FileText className="h-5 w-5" />,
      date: request.created_at,
      status: 'completed',
      description: "Maintenance request has been submitted and logged in the system"
    },
    {
      label: "Initial Review",
      icon: <AlertCircle className="h-5 w-5" />,
      date: request.status === 'pending' ? request.updated_at : null,
      status: request.status === 'pending' ? 'current' : 
             request.status === 'in_progress' || request.status === 'completed' ? 'completed' : 'pending',
      description: "Request is being reviewed by property management"
    },
    {
      label: "Cost Estimation",
      icon: <DollarSign className="h-5 w-5" />,
      date: request.cost_estimate ? request.updated_at : null,
      status: request.cost_estimate ? 'completed' : 
             request.status === 'in_progress' ? 'current' : 'pending',
      description: "Evaluating repair costs and preparing estimates"
    },
    {
      label: "Provider Assignment",
      icon: <User className="h-5 w-5" />,
      date: request.assigned_to ? request.updated_at : null,
      status: request.assigned_to ? 'completed' : 
             (request.status === 'in_progress' && !request.assigned_to) ? 'current' : 'pending',
      description: "Assigning qualified service provider to the task"
    },
    {
      label: "Scheduling",
      icon: <Calendar className="h-5 w-5" />,
      date: request.scheduled_date || null,
      status: request.scheduled_date ? 'completed' :
             (request.assigned_to && !request.scheduled_date) ? 'current' : 'pending',
      description: "Coordinating visit time with tenant and service provider"
    },
    {
      label: "Work In Progress",
      icon: <Wrench className="h-5 w-5" />,
      date: request.status === 'in_progress' ? request.updated_at : null,
      status: request.status === 'in_progress' ? 'current' :
             request.status === 'completed' ? 'completed' : 'pending',
      description: "Maintenance work is being carried out"
    },
    {
      label: "Quality Check",
      icon: <ClipboardCheck className="h-5 w-5" />,
      date: request.completion_report ? request.updated_at : null,
      status: request.completion_report ? 'completed' :
             (request.status === 'in_progress' && !request.completion_report) ? 'current' : 'pending',
      description: "Verifying the quality of completed work"
    },
    {
      label: "Tenant Feedback",
      icon: <MessageSquare className="h-5 w-5" />,
      date: request.rating ? request.updated_at : null,
      status: request.rating ? 'completed' :
             request.status === 'completed' ? 'current' : 'pending',
      description: "Collecting feedback from tenant on completed work"
    },
    {
      label: "Completed",
      icon: <CheckCircle2 className="h-5 w-5" />,
      date: request.completion_date || null,
      status: request.status === 'completed' ? 'completed' : 'pending',
      description: "Maintenance request has been successfully completed"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Request Progress</h3>
          <Badge className={getStatusColor(request.status)}>
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

          {userRole === 'landlord' && (
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
          )}

          <div className="mt-8">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={step.label} className="relative">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                      ${step.status === 'completed' ? 'border-green-500 bg-green-50' :
                        step.status === 'current' ? 'border-blue-500 bg-blue-50' :
                        'border-gray-300 bg-gray-50'}`}>
                      {React.cloneElement(step.icon, {
                        className: `h-5 w-5 ${
                          step.status === 'completed' ? 'text-green-500' :
                          step.status === 'current' ? 'text-blue-500' :
                          'text-gray-400'
                        }`
                      })}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        step.status === 'completed' ? 'text-green-700' :
                        step.status === 'current' ? 'text-blue-700' :
                        'text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                      <p className="text-sm text-gray-500">
                        {step.description}
                      </p>
                      {step.date && (
                        <p className="text-sm text-gray-500 mt-1">
                          {format(new Date(step.date), 'PPp')}
                        </p>
                      )}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute left-5 top-10 h-full w-px bg-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
