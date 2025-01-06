import * as z from "zod";

export const tenantFormSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  phone: z.string().optional(),
  property_id: z.string().uuid(),
  start_date: z.string().min(1),
  end_date: z.string().optional(),
});

export type TenantFormValues = z.infer<typeof tenantFormSchema>;