export interface Invoice {
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
  vat_rate?: number;
  currency: string;
  property?: {
    name: string;
    address: string;
  };
  tenant?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  amount: number;
  type: 'rent' | 'utility';
  created_at: string;
}