import { useCreateTenant } from "./mutations/useCreateTenant";
import { useUpdateTenant } from "./mutations/useUpdateTenant";

export function useTenantMutation() {
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();

  return {
    createTenant,
    updateTenant,
  };
}