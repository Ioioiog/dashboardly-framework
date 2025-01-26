export interface MaintenanceRequest {
  id: string;
  property_id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  issue_type?: string;
  priority?: 'low' | 'medium' | 'high';
  images?: string[];
  notes?: string;
  assigned_to?: string;
  service_provider_notes?: string;
  read_by_landlord?: boolean;
  read_by_tenant?: boolean;
  property?: {
    id: string;
    name: string;
    address: string;
  };
  tenant?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
  assignee?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export interface MaintenanceFormData {
  title: string;
  description: string;
  property_id: string;
  tenant_id: string;
  priority: 'low' | 'medium' | 'high';
  issue_type?: string;
  images?: File[];
}