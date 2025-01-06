export interface Tenant {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  property: {
    id: string;
    name: string;
    address: string;
  };
  tenancy: {
    start_date: string;
    end_date: string | null;
    status: string;
  };
}

export interface Property {
  id: string;
  name: string;
  address: string;
}