import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Property {
  id: string;
  name: string;
}

export interface MaintenanceFormValues {
  title: string;
  description: string;
  property_id: string;
  priority: string;
  status: string;
  notes: string;
  assigned_to: string;
  service_provider_notes: string;
  images: File[] | string[];
  tenant_id: string;
}

interface MaintenanceRequestFormProps {
  defaultValues: MaintenanceFormValues;
  onSubmit: (values: MaintenanceFormValues) => void;
  properties: Property[];
  userRole: string;
  serviceProviders?: Array<{ id: string; first_name: string; last_name: string; }>;
}

export function MaintenanceRequestForm({
  defaultValues,
  onSubmit,
  properties,
  userRole,
  serviceProviders,
}: MaintenanceRequestFormProps) {
  const { t } = useTranslation();
  const form = useForm<MaintenanceFormValues>({ defaultValues });
  const isExistingRequest = defaultValues.title !== "";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Tenant Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t("maintenance.form.requestDetails")}</h3>
            <FormField
              control={form.control}
              name="property_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("maintenance.property")}</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={userRole === "landlord" || isExistingRequest}
                  >
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
                    <Input {...field} disabled={userRole === "landlord"} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={userRole === "landlord"} />
                  </FormControl>
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
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={userRole === "landlord"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">
                        {t("maintenance.priority.low")}
                      </SelectItem>
                      <SelectItem value="medium">
                        {t("maintenance.priority.medium")}
                      </SelectItem>
                      <SelectItem value="high">
                        {t("maintenance.priority.high")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={userRole === "landlord"}
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          onChange(files);
                        }}
                        {...field}
                      />
                      {/* Display existing images */}
                      {value && value.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                          {(value as (File | string)[]).map((image, index) => (
                            <div key={index} className="relative aspect-square">
                              <img
                                src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                                alt={`Uploaded image ${index + 1}`}
                                className="rounded-lg object-cover w-full h-full"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Column - Landlord Actions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t("maintenance.form.landlordActions")}</h3>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={userRole !== "landlord"}
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
                    disabled={userRole !== "landlord"}
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
                      disabled={userRole !== "landlord"}
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
                      disabled={userRole !== "landlord"}
                      placeholder="Add instructions for the service provider"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit">
            {isExistingRequest ? "Update Request" : "Create Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}