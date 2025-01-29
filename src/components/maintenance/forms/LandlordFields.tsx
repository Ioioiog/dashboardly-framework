import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { MaintenanceFormValues } from "./MaintenanceRequestForm";

interface LandlordFieldsProps {
  form: UseFormReturn<MaintenanceFormValues>;
  serviceProviders?: Array<{ id: string; first_name: string; last_name: string; }>;
  userRole: string;
}

export function LandlordFields({ form, serviceProviders, userRole }: LandlordFieldsProps) {
  const isLandlord = userRole === "landlord";

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!isLandlord}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="assigned_to"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assign To</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!isLandlord}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select service provider" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {serviceProviders?.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {`${provider.first_name} ${provider.last_name}`}
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
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Internal Notes</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                disabled={!isLandlord}
                placeholder="Add internal notes about this request"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="service_provider_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Service Provider Instructions</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                disabled={!isLandlord}
                placeholder="Add instructions for the service provider"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}