export interface MaintenanceRequest {
  id: string;
  property_id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
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
}

export type MaintenancePriority = 'Low' | 'Medium' | 'High';
export type MaintenanceIssueType = 'Plumbing' | 'Electrical' | 'HVAC' | 'Structural' | 'Appliance' | 'Other';