import React, { useEffect, useState } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

  const processImages = (images: (string | File)[]): string[] => {
    if (!images) return [];
    
    console.log("Processing images:", images);
    
    const validImages = images.filter((image): image is string | File => {
      if (!image) return false;
      if (typeof image === "string") {
        return image !== "{}" && image.startsWith("http");
      }
      return image instanceof File;
    });
    
    console.log("Valid images after filtering:", validImages);
    
    return validImages.map(image => {
      if (image instanceof File) {
        return URL.createObjectURL(image);
      }
      return image as string;
    });
  };

  useEffect(() => {
    console.log("Images in form:", images);
    
    const urls = processImages(images);
    console.log("Generated image URLs:", urls);
    setImageUrls(urls);

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
    const validCurrentImages = images.filter(img => 
      img && 
      typeof img === "string" && 
      img !== "{}" && 
      img.startsWith("http")
    );
    
    console.log("Valid current images:", validCurrentImages);

    const totalImages = validCurrentImages.length + files.length;
    console.log("Total images count:", totalImages);

    if (totalImages > MAX_IMAGES) {
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

    console.log("Valid files to upload:", validFiles);
    const newImages = [...validCurrentImages, ...validFiles];
    console.log("Setting new images:", newImages);
    
    onChange(newImages);
  };

  const handleDeleteImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
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

      <FormItem>
        <FormLabel>Images (Max {MAX_IMAGES})</FormLabel>
        <FormControl>
          <div className="space-y-4">
            <Input
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              multiple
              disabled={disabled || imageUrls.length >= MAX_IMAGES}
              onChange={handleImageUpload}
            />
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
                    {!disabled && (
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
    </>
  );
}