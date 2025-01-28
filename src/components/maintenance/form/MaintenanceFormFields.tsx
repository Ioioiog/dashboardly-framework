import {
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
import { UseFormReturn } from "react-hook-form";
import { Property } from "@/utils/propertyUtils";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

interface MaintenanceFormFieldsProps {
  form: UseFormReturn<any>;
  properties: Property[];
  userRole: string;
  section: "tenant" | "landlord";
}

export function MaintenanceFormFields({ 
  form, 
  properties, 
  userRole,
  section 
}: MaintenanceFormFieldsProps) {
  const { t } = useTranslation();

  if (section === "tenant") {
    return (
      <>
        <FormField
          control={form.control}
          name="property_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('maintenance.property')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={t('maintenance.selectProperty')} />
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('maintenance.title')}</FormLabel>
              <FormControl>
                <Input placeholder={t('maintenance.enterTitle')} {...field} className="bg-white" />
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
              <FormLabel>{t('maintenance.description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('maintenance.enterDescription')}
                  className="min-h-[100px] bg-white"
                  {...field}
                />
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
              <FormLabel>{t('maintenance.priority')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={t('maintenance.selectPriority')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Low">{t('maintenance.priority.low')}</SelectItem>
                  <SelectItem value="Medium">{t('maintenance.priority.medium')}</SelectItem>
                  <SelectItem value="High">{t('maintenance.priority.high')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    );
  }

  if (section === "landlord" && userRole === "landlord") {
    return (
      <>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('maintenance.status')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={t('maintenance.selectStatus')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">{t('maintenance.status.pending')}</SelectItem>
                  <SelectItem value="in_progress">{t('maintenance.status.in_progress')}</SelectItem>
                  <SelectItem value="completed">{t('maintenance.status.completed')}</SelectItem>
                  <SelectItem value="cancelled">{t('maintenance.status.cancelled')}</SelectItem>
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
              <FormLabel>{t('maintenance.landlordNotes')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('maintenance.enterNotes')}
                  className="min-h-[100px] bg-white"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.getValues("updated_at") && (
          <div className="text-sm text-gray-500">
            {t('maintenance.lastUpdated')}: {format(new Date(form.getValues("updated_at")), "PPpp")}
          </div>
        )}
      </>
    );
  }

  return null;
}