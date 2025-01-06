import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { tenantFormSchema, type TenantFormValues } from "./TenantFormSchema";
import { TenantContactFields } from "./form/TenantContactFields";
import { TenantPropertyFields } from "./form/TenantPropertyFields";
import type { Property } from "@/types/tenant";

interface TenantFormProps {
  onSubmit: (data: TenantFormValues) => Promise<void>;
  properties: Property[];
  tenant?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    tenancy: {
      property_id: string;
      start_date: string;
      end_date?: string;
    };
  };
}

export function TenantForm({ onSubmit, properties, tenant }: TenantFormProps) {
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: tenant ? {
      email: tenant.email,
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      phone: tenant.phone || "",
      property_id: tenant.tenancy.property_id,
      start_date: tenant.tenancy.start_date,
      end_date: tenant.tenancy.end_date || "",
    } : {
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      property_id: "",
      start_date: "",
      end_date: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TenantContactFields form={form} isEditing={!!tenant} />
        <TenantPropertyFields form={form} properties={properties} />
        <Button type="submit" className="w-full">
          {tenant ? "Update Tenant" : "Add Tenant"}
        </Button>
      </form>
    </Form>
  );
}