import React, { useEffect, useState } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { ImageThumbnail } from "./ImageThumbnail";

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
  const [processedUrls, setProcessedUrls] = useState<string[]>([]);
  const [blobUrls, setBlobUrls] = useState<string[]>([]);

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
    
    // Clear existing blob URLs
    blobUrls.forEach(url => {
      if (url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error("Error revoking blob URL:", error);
        }
      }
    });
    
    const newBlobUrls: string[] = [];
    const urls = await Promise.all(images.map(async (image) => {
      if (!image) return '';
      
      if (image instanceof File) {
        try {
          const blobUrl = URL.createObjectURL(image);
          newBlobUrls.push(blobUrl);
          
          // Verify the blob URL is valid
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = blobUrl;
          });
          
          return blobUrl;
        } catch (error) {
          console.error("Error creating/verifying blob URL:", error);
          return '';
        }
      }
      
      if (typeof image === "string") {
        return image;
      }
      
      return '';
    })).then(urls => urls.filter(Boolean));
    
    setBlobUrls(newBlobUrls);
    setProcessedUrls(urls);
    return urls;
  };

  useEffect(() => {
    console.log("Images in form:", images);
    processImages(images).then(urls => {
      console.log("Generated image URLs:", urls);
    });

    return () => {
      // Cleanup blob URLs on unmount or when images change
      blobUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(url);
          } catch (error) {
            console.error("Error revoking blob URL on cleanup:", error);
          }
        }
      });
    };
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

  const handleDeleteImage = (index: number) => {
    const newImages = [...images];
    if (processedUrls[index]?.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(processedUrls[index]);
      } catch (error) {
        console.error("Error revoking blob URL on delete:", error);
      }
    }
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => {
      const newIndex = prev - 1;
      if (newIndex < 0) return processedUrls.length - 1;
      return newIndex;
    });
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => {
      const newIndex = prev + 1;
      if (newIndex >= processedUrls.length) return 0;
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
          totalImages={processedUrls.length}
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
                disabled={disabled || processedUrls.length >= MAX_IMAGES}
                onChange={handleImageUpload}
                className="cursor-pointer file:cursor-pointer file:border-0 file:bg-blue-500 file:text-white file:px-4 file:py-2 file:mr-4 file:rounded-md hover:file:bg-blue-600 transition-colors"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <Upload className="h-4 w-4" />
              </div>
            </div>
            {processedUrls.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {processedUrls.map((imageUrl, index) => (
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