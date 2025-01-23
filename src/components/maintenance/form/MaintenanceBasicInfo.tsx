import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { MaintenanceFormValues } from "../types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceBasicInfoProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

export function MaintenanceBasicInfo({ form }: MaintenanceBasicInfoProps) {
  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      console.log("Fetching user profile...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user");
        throw new Error("No authenticated user");
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      console.log("User profile fetched:", profile);
      return profile;
    },
    retry: 1
  });

  // Fetch properties based on user role
  const { data: properties } = useQuery({
    queryKey: ["properties", userProfile?.id, userProfile?.role],
    queryFn: async () => {
      if (!userProfile?.id) {
        console.log("No user profile available");
        return [];
      }

      console.log("Fetching properties for user role:", userProfile.role);

      if (userProfile.role === "landlord") {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("landlord_id", userProfile.id)
          .order("name");

        if (error) {
          console.error("Error fetching landlord properties:", error);
          throw error;
        }

        console.log("Landlord properties fetched:", data);
        return data;
      } else {
        // For tenants, fetch only properties they're assigned to
        const { data, error } = await supabase
          .from("tenancies")
          .select(`
            property:properties (
              id,
              name,
              address
            )
          `)
          .eq("tenant_id", userProfile.id)
          .eq("status", "active");

        if (error) {
          console.error("Error fetching tenant properties:", error);
          throw error;
        }

        const tenantProperties = data.map(t => t.property).filter(Boolean);
        console.log("Tenant properties fetched:", tenantProperties);
        return tenantProperties;
      }
    },
    enabled: !!userProfile?.id
  });

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="property_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Property</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {properties?.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Brief description of the issue" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="issue_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Issue Type</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Plumbing">Plumbing</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="HVAC">HVAC</SelectItem>
                <SelectItem value="Structural">Structural</SelectItem>
                <SelectItem value="Appliance">Appliance</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Priority</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}