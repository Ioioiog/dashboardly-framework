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
        monthly_pay_day: number | null;
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
        monthly_pay_day?: number | null;
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
        monthly_pay_day?: number | null;
      };
    };
  };
}