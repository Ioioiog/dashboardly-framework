export interface MaintenanceSchema {
  Tables: {
    maintenance_requests: {
      Row: {
        id: string;
        property_id: string;
        tenant_id: string;
        title: string;
        description: string;
        status: string;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        property_id: string;
        tenant_id: string;
        title: string;
        description: string;
        status?: string;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        property_id?: string;
        tenant_id?: string;
        title?: string;
        description?: string;
        status?: string;
        created_at?: string;
        updated_at?: string;
      };
    };
  };
}