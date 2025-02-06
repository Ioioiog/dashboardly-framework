import { z } from "zod";

export const MaintenanceRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  property_id: z.string().min(1, "Property is required"),
  tenant_id: z.string().min(1, "Tenant ID is required"),
  priority: z.enum(["low", "medium", "high"]).default("low"),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"),
  notes: z.string().nullable().optional(),
  assigned_to: z.string().nullable().optional(),
  service_provider_notes: z.string().nullable().optional(),
  images: z.array(z.string()).default([]),
  scheduled_date: z.string().nullable().optional(),
  service_provider_fee: z.number().nullable().optional(),
  service_provider_status: z.string().nullable().optional(),
  completion_report: z.string().nullable().optional(),
  payment_amount: z.number().optional(),
  payment_status: z.string().nullable().optional(),
  read_by_landlord: z.boolean().optional(),
  read_by_tenant: z.boolean().optional(),
  is_emergency: z.boolean().optional(),
  emergency_contact_name: z.string().nullable().optional(),
  emergency_contact_phone: z.string().nullable().optional(),
  emergency_instructions: z.string().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  preferred_times: z.array(z.string()).optional()
});

export type MaintenanceRequestFormData = z.infer<typeof MaintenanceRequestSchema>;

export type MaintenanceStatus = "pending" | "in_progress" | "completed" | "cancelled";

export const validateMaintenanceRequest = (data: unknown) => {
  console.log("Validating maintenance request data:", data);
  const result = MaintenanceRequestSchema.safeParse(data);
  
  if (!result.success) {
    console.error("Validation errors:", result.error.errors);
    const errorMessages = result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    ).join(', ');
    throw new Error(`Validation failed: ${errorMessages}`);
  }
  
  return result.data;
};