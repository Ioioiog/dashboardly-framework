export interface DocumentSchema {
  Tables: {
    documents: {
      Row: {
        id: string;
        name: string;
        file_path: string;
        property_id: string | null;
        tenant_id: string | null;
        uploaded_by: string;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        name: string;
        file_path: string;
        property_id?: string | null;
        tenant_id?: string | null;
        uploaded_by: string;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        name?: string;
        file_path?: string;
        property_id?: string | null;
        tenant_id?: string | null;
        uploaded_by?: string;
        created_at?: string;
        updated_at?: string;
      };
    };
  };
}