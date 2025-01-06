export interface MaintenanceRequest {
  id: string;
  property_id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  property?: {
    id: string;
    name: string;
    address: string;
  };
}