export interface Profile {
  Row: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: string;
    created_at: string;
    updated_at: string;
    email: string | null;
    phone: string | null;
  };
  Insert: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    role?: string;
    email?: string | null;
    phone?: string | null;
  };
  Update: {
    first_name?: string | null;
    last_name?: string | null;
    role?: string;
    email?: string | null;
    phone?: string | null;
  };
}