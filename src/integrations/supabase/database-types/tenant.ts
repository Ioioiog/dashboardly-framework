export interface TenantSchema {
  Tables: {
    tenancies: {
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
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        property_id?: string;
        tenant_id?: string;
        start_date?: string;
        end_date?: string | null;
        status?: string;
        created_at?: string;
        updated_at?: string;
      };
    };
    tenant_invitations: {
      Row: {
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
      };
      Insert: {
        id?: string;
        email: string;
        first_name?: string | null;
        last_name?: string | null;
        property_id: string;
        token: string;
        status?: string;
        start_date: string;
        end_date?: string | null;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        email?: string;
        first_name?: string | null;
        last_name?: string | null;
        property_id?: string;
        token?: string;
        status?: string;
        start_date?: string;
        end_date?: string | null;
        created_at?: string;
        updated_at?: string;
      };
    };
  };
}