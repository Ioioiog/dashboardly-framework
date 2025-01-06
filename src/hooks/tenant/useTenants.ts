import { useQuery } from "@tanstack/react-query";
import { fetchLandlordTenants } from "./useLandlordTenants";
import { fetchTenantDetails } from "./useTenantDetails";

export function useTenants(userId: string, userRole: "landlord" | "tenant") {
  return useQuery({
    queryKey: ["tenants", userId, userRole],
    queryFn: () => userRole === "landlord" 
      ? fetchLandlordTenants(userId)
      : fetchTenantDetails(userId),
  });
}