import { MaintenanceIssueType, MaintenancePriority, MaintenanceRequestStatus } from "@/types/maintenance";

export const ISSUE_TYPES: MaintenanceIssueType[] = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Structural",
  "Appliance",
  "Other",
];

export const PRIORITIES: MaintenancePriority[] = ["Low", "Medium", "High"];

export const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
} as const;

export const STATUS_OPTIONS: MaintenanceRequestStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
];