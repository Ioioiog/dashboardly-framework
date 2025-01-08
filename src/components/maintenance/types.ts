import { z } from "zod";

export const maintenanceFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  issue_type: z.string().min(1, "Please select an issue type"),
  priority: z.string().min(1, "Please select a priority"),
  notes: z.string().optional(),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;