import { supabase } from "@/integrations/supabase/client";
import { TenantActionType } from "@/types/tenant-audit";

export const tenantAuditService = {
  async logTenantAction(data: {
    action_type: TenantActionType;
    landlord_id: string;
    tenant_id?: string;
    tenant_email?: string;
    property_ids: string[];
    metadata?: Record<string, any>;
  }) {
    console.log("Logging tenant action:", data);

    try {
      const { error } = await supabase
        .from('tenant_audit_logs')
        .insert(data);

      if (error) {
        console.error("Error logging tenant action:", error);
        throw error;
      }

      console.log("Successfully logged tenant action");
    } catch (error) {
      console.error("Failed to log tenant action:", error);
      // Don't throw the error - we don't want audit logging failures to break the main flow
    }
  }
};