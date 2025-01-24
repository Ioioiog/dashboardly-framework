import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  property_id: z.string().uuid("Please select a property"),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  notes: z.string().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
});

export type FormData = z.infer<typeof formSchema>;

interface UseMaintenanceFormProps {
  request?: any;
  userRole: string;
  onSuccess: () => void;
}

export function useMaintenanceForm({ request, userRole, onSuccess }: UseMaintenanceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: request?.title || "",
      description: request?.description || "",
      property_id: request?.property_id || "",
      priority: request?.priority as "Low" | "Medium" | "High" || "Low",
      status: userRole === "tenant" ? "pending" : (request?.status || "pending"),
      notes: request?.notes || "",
      assigned_to: request?.assigned_to || null,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedImages(Array.from(files));
    }
  };

  const uploadImages = async () => {
    const uploadedUrls: string[] = [];
    
    for (const file of selectedImages) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      console.log('Uploading image:', fileName);
      
      const { error: uploadError, data } = await supabase.storage
        .from('maintenance-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error('Failed to upload image');
      }

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('maintenance-images')
          .getPublicUrl(fileName);
        
        console.log('Image uploaded successfully:', publicUrl);
        uploadedUrls.push(publicUrl);
      }
    }

    return uploadedUrls;
  };

  return {
    form,
    isSubmitting,
    selectedImages,
    handleImageChange,
    uploadImages,
    setIsSubmitting,
  };
}