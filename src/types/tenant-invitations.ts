export interface TenantInvitation {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  property_id: string;
  token: string;
  status: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  property?: {
    name: string;
  };
}