export interface MaintenanceRequest {
  id: string;
  property_id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: MaintenanceRequestStatus;
  created_at: string;
  updated_at: string;
  issue_type?: string;
  priority?: string;
  images?: string[];
  notes?: string;
  assigned_to?: string;
  service_provider_notes?: string;
  property?: {
    id: string;
    name: string;
    address: string;
  };
  tenant?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export type MaintenanceRequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type MaintenancePriority = 'Low' | 'Medium' | 'High';
export type MaintenanceIssueType = 'Plumbing' | 'Electrical' | 'HVAC' | 'Structural' | 'Appliance' | 'Other';