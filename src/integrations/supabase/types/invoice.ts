export interface InvoiceWithRelations {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  paid_at: string | null;
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