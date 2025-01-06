import * as z from "zod";

export const tenantFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().optional(),
  property_id: z.string().uuid("Please select a property"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
});

export type TenantFormValues = z.infer<typeof tenantFormSchema>;