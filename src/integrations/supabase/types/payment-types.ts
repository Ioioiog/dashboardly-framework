export interface PaymentSchema {
  Tables: {
    payments: {
      Row: {
        id: string;
        tenancy_id: string;
        amount: number;
        due_date: string;
        paid_date: string | null;
        status: string;
        created_at: string;
        updated_at: string;
        read_by_landlord: boolean | null;
        read_by_tenant: boolean | null;
        currency: string;
      };
      Insert: {
        id?: string;
        tenancy_id: string;
        amount: number;
        due_date: string;
        paid_date?: string | null;
        status?: string;
        created_at?: string;
        updated_at?: string;
        read_by_landlord?: boolean | null;
        read_by_tenant?: boolean | null;
        currency?: string;
      };
      Update: {
        id?: string;
        tenancy_id?: string;
        amount?: number;
        due_date?: string;
        paid_date?: string | null;
        status?: string;
        created_at?: string;
        updated_at?: string;
        read_by_landlord?: boolean | null;
        read_by_tenant?: boolean | null;
        currency?: string;
      };
    };
  };
}