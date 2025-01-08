export interface Payment {
  Row: {
    id: string;
    tenancy_id: string;
    amount: number;
    due_date: string;
    paid_date: string | null;
    status: string;
    created_at: string;
    updated_at: string;
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
  };
}

export interface PaymentWithRelations {
  id: string;
  tenancy_id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  tenancy: {
    property: {
      name: string;
      address: string;
    };
    tenant: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}