export interface Document {
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
  };
  Update: {
    name?: string;
    file_path?: string;
    property_id?: string | null;
    tenant_id?: string | null;
  };
}