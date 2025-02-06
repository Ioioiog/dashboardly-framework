export interface UtilitySchema {
  Tables: {
    utilities: {
      Row: {
        id: string;
        property_id: string;
        type: string;
        amount: number;
        due_date: string;
        status: string;
        created_at: string;
        updated_at: string;
        currency: string;
      };
      Insert: {
        id?: string;
        property_id: string;
        type: string;
        amount: number;
        due_date: string;
        status?: string;
        created_at?: string;
        updated_at?: string;
        currency?: string;
      };
      Update: {
        id?: string;
        property_id?: string;
        type?: string;
        amount?: number;
        due_date?: string;
        status?: string;
        created_at?: string;
        updated_at?: string;
        currency?: string;
      };
    };
  };
}