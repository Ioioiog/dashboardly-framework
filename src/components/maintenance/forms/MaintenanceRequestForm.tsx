import React, { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  images: (string | File)[];
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Watch for changes in the images field
  const images = form.watch("images") || [];

  useEffect(() => {
    console.log("Images changed:", images);
    
    // Create URLs for all images (both Files and strings)
    const urls = images.map(image => {
      if (typeof image === 'string') {
        return image;
      }
      return URL.createObjectURL(image as File);
    });
    
    console.log("Generated URLs:", urls);
    setImageUrls(urls);

    // Cleanup function to revoke object URLs
    return () => {
      urls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentImages = form.getValues("images") || [];
    const totalImages = currentImages.length + files.length;

    if (totalImages > 3) {
      toast({
        title: "Error",
        description: "You can only upload up to 3 images",
        variant: "destructive",
      });
      return;
    }

    console.log("Current images:", currentImages);
    console.log("New files:", files);

    form.setValue("images", [...currentImages, ...files]);
  };

  const handleDeleteImage = (index: number) => {
    const currentImages = form.getValues("images");
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    form.setValue("images", newImages);
  };

  return (
    <>
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Image Preview</DialogTitle>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Maintenance request"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Request Details */}
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
                    <FormLabel>Images (Max 3)</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={userRole === "landlord" || imageUrls.length >= 3}
                          onChange={handleImageUpload}
                          {...field}
                        />
                        {/* Display existing images */}
                        {imageUrls.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                            {imageUrls.map((imageUrl, index) => (
                              <div 
                                key={index} 
                                className="relative aspect-square group"
                              >
                                <img
                                  src={imageUrl}
                                  alt={`Uploaded image ${index + 1}`}
                                  className="rounded-lg object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setSelectedImage(imageUrl)}
                                />
                                {userRole !== "landlord" && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
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
    </>
  );
}