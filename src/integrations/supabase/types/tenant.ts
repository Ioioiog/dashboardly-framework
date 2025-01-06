export interface Tenant {
  Row: {
    id: string;
    property_id: string;
    tenant_id: string;
    start_date: string;
    end_date: string | null;
    status: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    property_id: string;
    tenant_id: string;
    start_date: string;
    end_date?: string | null;
    status?: string;
  };
  Update: {
    property_id?: string;
    start_date?: string;
    end_date?: string | null;
    status?: string;
  };
}