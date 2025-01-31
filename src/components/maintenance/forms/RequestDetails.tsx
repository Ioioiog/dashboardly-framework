import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

interface RequestDetailsProps {
  form: any;
  properties: Array<{ id: string; name: string }>;
  userRole: string;
  isExistingRequest?: boolean;
}

export function RequestDetails({
  form,
  properties,
  userRole,
  isExistingRequest
}: RequestDetailsProps) {
  const { t } = useTranslation();

  const statusOptions = [
    { value: "pending", label: t("maintenance.status.pending") },
    { value: "in_progress", label: t("maintenance.status.in_progress") },
    { value: "completed", label: t("maintenance.status.completed") },
    { value: "cancelled", label: t("maintenance.status.cancelled") }
  ];

  const priorityOptions = [
    { value: "low", label: t("maintenance.priority.low") },
    { value: "medium", label: t("maintenance.priority.medium") },
    { value: "high", label: t("maintenance.priority.high") }
  ];

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("maintenance.form.title")}</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                disabled={userRole === "landlord"}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("maintenance.form.description")}</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                disabled={userRole === "landlord"}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="property_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("maintenance.form.property")}</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={userRole === "landlord" || isExistingRequest}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("maintenance.form.selectProperty")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {properties.map((property) => (
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
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("maintenance.form.priority")}</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={userRole === "landlord"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("maintenance.form.selectPriority")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {isExistingRequest && (
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("maintenance.form.status")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={userRole !== "landlord"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("maintenance.form.selectStatus")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}