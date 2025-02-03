import React, { useEffect, useState } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    if (selectedImage) {
      const index = imageUrls.findIndex(url => url === selectedImage);
      if (index !== -1) {
        setCurrentImageIndex(index);
      }
    }
  }, [selectedImage, imageUrls]);

  const handleImageClick = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl);
    setCurrentImageIndex(index);
  };

  const handleDeleteClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    handleDeleteImage(index);
  };

  return (
    <>
      <Dialog 
        open={!!selectedImage} 
        onOpenChange={(open) => {
          if (!open) setSelectedImage(null);
        }}
      >
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/90">
          <DialogTitle className="p-4 text-white">
            Image Preview ({currentImageIndex + 1} of {imageUrls.length})
          </DialogTitle>
          <div className="relative flex items-center justify-center min-h-[300px] md:min-h-[500px]">
            {selectedImage && (
              <>
                <img
                  src={selectedImage}
                  alt="Maintenance request"
                  className="max-h-[70vh] object-contain"
                />
                {imageUrls.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 text-white hover:bg-white/20"
                      onClick={handlePreviousImage}
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 text-white hover:bg-white/20"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-8 w-8" />
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
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
                    <div className="w-full h-full">
                      <img
                        src={imageUrl}
                        alt={`Uploaded image ${index + 1}`}
                        className="rounded-lg object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="mr-2"
                          onClick={() => handleImageClick(imageUrl, index)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
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
