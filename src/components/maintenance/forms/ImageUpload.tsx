import React, { useEffect, useState } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { ImageThumbnail } from "./ImageThumbnail";
import { supabase } from "@/integrations/supabase/client";

const MAX_IMAGES = 3;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ImageUploadProps {
  images: (string | File)[];
  onChange: (images: (string | File)[]) => void;
  disabled?: boolean;
}

export function ImageUpload({ images, onChange, disabled }: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const validateImage = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP)";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File is too large. Maximum size is 5MB";
    }
    return null;
  };

  const processImages = async (images: (string | File)[]): Promise<string[]> => {
    if (!images) return [];
    
    console.log("Processing images:", images);
    
    const urls = await Promise.all(images.map(async (image) => {
      if (!image) return '';
      
      if (image instanceof File) {
        try {
          // Upload to Supabase storage and get URL
          const fileExt = image.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('maintenance-images')
            .upload(fileName, image);

          if (uploadError) {
            console.error("Error uploading to Supabase:", uploadError);
            return '';
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('maintenance-images')
            .getPublicUrl(fileName);

          return publicUrl;
        } catch (error) {
          console.error("Error processing file upload:", error);
          return '';
        }
      }
      
      if (typeof image === "string") {
        return image;
      }
      
      return '';
    }));
    
    setImageUrls(urls.filter(Boolean));
    return urls.filter(Boolean);
  };

  useEffect(() => {
    console.log("Images in form:", images);
    processImages(images).then(urls => {
      console.log("Generated image URLs:", urls);
    });
  }, [images]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validCurrentImages = images.filter(img => 
      img && 
      (typeof img === "string" || img instanceof File)
    );
    
    if (validCurrentImages.length + files.length > MAX_IMAGES) {
      toast({
        title: "Error",
        description: `You can only upload up to ${MAX_IMAGES} images`,
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter(file => {
      const error = validateImage(file);
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    const newImages = [...validCurrentImages, ...validFiles];
    onChange(newImages);
  };

  const handleDeleteImage = async (index: number) => {
    const imageToDelete = imageUrls[index];
    if (imageToDelete && imageToDelete.includes('maintenance-images')) {
      // Extract filename from URL
      const fileName = imageToDelete.split('/').pop();
      if (fileName) {
        try {
          const { error } = await supabase.storage
            .from('maintenance-images')
            .remove([fileName]);
          
          if (error) {
            console.error("Error deleting from Supabase:", error);
          }
        } catch (error) {
          console.error("Error in delete operation:", error);
        }
      }
    }

    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => {
      const newIndex = prev - 1;
      if (newIndex < 0) return imageUrls.length - 1;
      return newIndex;
    });
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => {
      const newIndex = prev + 1;
      if (newIndex >= imageUrls.length) return 0;
      return newIndex;
    });
  };

  return (
    <>
      <Dialog 
        open={!!selectedImage} 
        onOpenChange={(open) => {
          if (!open) setSelectedImage(null);
        }}
      >
        <ImagePreviewDialog
          selectedImage={selectedImage}
          onClose={() => setSelectedImage(null)}
          onPrevious={handlePreviousImage}
          onNext={handleNextImage}
          totalImages={imageUrls.length}
          currentIndex={currentImageIndex}
        />
      </Dialog>

      <FormItem>
        <FormLabel>Images (Max {MAX_IMAGES})</FormLabel>
        <FormControl>
          <div className="space-y-6">
            <div className="relative">
              <Input
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                multiple
                disabled={disabled || imageUrls.length >= MAX_IMAGES}
                onChange={handleImageUpload}
                className="cursor-pointer file:cursor-pointer file:border-0 file:bg-blue-500 file:text-white file:px-4 file:py-2 file:mr-4 file:rounded-md hover:file:bg-blue-600 transition-colors"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <Upload className="h-4 w-4" />
              </div>
            </div>
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {imageUrls.map((imageUrl, index) => (
                  <ImageThumbnail
                    key={index}
                    imageUrl={imageUrl}
                    index={index}
                    onView={() => {
                      setSelectedImage(imageUrl);
                      setCurrentImageIndex(index);
                    }}
                    onDelete={() => handleDeleteImage(index)}
                    disabled={disabled}
                  />
                ))}
              </div>
            )}
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    </>
  );
}