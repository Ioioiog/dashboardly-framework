export type TenantActionType = 
  | 'invitation_sent'
  | 'invitation_resent'
  | 'invitation_accepted'
  | 'tenant_assigned'
  | 'tenancy_ended';

export interface TenantAuditLog {
  id: string;
  action_type: TenantActionType;
  landlord_id: string;
  tenant_id?: string;
  tenant_email?: string;
  property_ids: string[];
  metadata?: Record<string, any>;
  created_at: string;
}