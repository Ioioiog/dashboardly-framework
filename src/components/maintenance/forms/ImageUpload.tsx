import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
}

export function ImageUpload({ images, onChange, disabled }: ImageUploadProps) {
  const { toast } = useToast();
  const maxImages = 5;
  const maxSizeInMB = 5;

  const uploadImage = useCallback(async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('maintenance-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('maintenance-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (images.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images`,
        variant: "destructive"
      });
      return;
    }

    for (const file of files) {
      if (file.size > maxSizeInMB * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `Image ${file.name} exceeds ${maxSizeInMB}MB limit`,
          variant: "destructive"
        });
        continue;
      }

      try {
        const publicUrl = await uploadImage(file);
        onChange([...images, publicUrl]);
      } catch (error) {
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive"
        });
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const imageUrl = images[index];
      const fileName = imageUrl.split('/').pop();
      
      if (fileName) {
        await supabase.storage
          .from('maintenance-images')
          .remove([fileName]);
      }

      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Uploaded image ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
              loading="lazy"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {!disabled && images.length < maxImages && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                disabled={disabled}
              />
              <div className="flex flex-col items-center gap-2 text-gray-600">
                <ImagePlus className="h-8 w-8" />
                <span className="text-sm">Add Image</span>
              </div>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}