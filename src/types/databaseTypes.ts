import { Database } from '@/integrations/supabase/types';

// Common table types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Property = Database['public']['Tables']['properties']['Row'];
export type Tenancy = Database['public']['Tables']['tenancies']['Row'];
export type Maintenance = Database['public']['Tables']['maintenance_requests']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Document = Database['public']['Tables']['documents']['Row'];
export type Utility = Database['public']['Tables']['utilities']['Row'];

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type TenancyInsert = Database['public']['Tables']['tenancies']['Insert'];
export type MaintenanceInsert = Database['public']['Tables']['maintenance_requests']['Insert'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
export type UtilityInsert = Database['public']['Tables']['utilities']['Insert'];

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];
export type TenancyUpdate = Database['public']['Tables']['tenancies']['Update'];
export type MaintenanceUpdate = Database['public']['Tables']['maintenance_requests']['Update'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];
export type DocumentUpdate = Database['public']['Tables']['documents']['Update'];
export type UtilityUpdate = Database['public']['Tables']['utilities']['Update'];

// Enum types
export type PropertyType = Database['public']['Enums']['property_type'];
export type MaintenanceStatus = Database['public']['Enums']['maintenance_request_status'];
export type InvoiceStatus = Database['public']['Enums']['invoice_status'];
export type DocumentType = Database['public']['Enums']['document_type'];
export type ScrapingStatus = Database['public']['Enums']['scraping_status'];