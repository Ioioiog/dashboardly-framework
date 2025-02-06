import React, { useEffect, useState } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight, Eye, Upload } from "lucide-react";
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

  const processImages = (images: (string | File)[]): string[] => {
    if (!images) return [];
    
    console.log("Processing images:", images);
    
    // Clear existing blob URLs
    blobUrls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    
    const newBlobUrls: string[] = [];
    const urls = images.map(image => {
      if (!image) return '';
      
      if (image instanceof File) {
        const blobUrl = URL.createObjectURL(image);
        newBlobUrls.push(blobUrl);
        return blobUrl;
      }
      
      if (typeof image === "string") {
        return image;
      }
      
      return '';
    }).filter(Boolean);
    
    setBlobUrls(newBlobUrls);
    return urls;
  };

  useEffect(() => {
    console.log("Images in form:", images);
    const urls = processImages(images);
    console.log("Generated image URLs:", urls);

    return () => {
      // Cleanup blob URLs on unmount
      blobUrls.forEach(url => {
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
      (typeof img === "string" || img instanceof File)
    );
    
    console.log("Valid current images:", validCurrentImages);
    console.log("Total images count:", validCurrentImages.length + files.length);

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
        <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0 overflow-hidden bg-black/90">
          <DialogTitle className="p-8 text-white flex items-center justify-between">
            <span className="text-xl">Image Preview ({currentImageIndex + 1} of {imageUrls.length})</span>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogTitle>
          <div className="relative flex items-center justify-center h-[calc(90vh-5rem)]">
            {selectedImage && (
              <>
                <img
                  src={selectedImage}
                  alt="Maintenance request"
                  className="max-h-[85vh] max-w-[90vw] object-contain"
                />
                {imageUrls.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 text-white hover:bg-white/20"
                      onClick={handlePreviousImage}
                    >
                      <ChevronLeft className="h-12 w-12" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 text-white hover:bg-white/20"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-12 w-12" />
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
                  <div 
                    key={index} 
                    className="relative aspect-square group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-full h-full">
                      <img
                        src={imageUrl}
                        alt={`Uploaded image ${index + 1}`}
                        className="rounded-lg object-cover w-full h-full transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="secondary"
                          size="xl"
                          className="mr-2 px-8 py-6 text-lg"
                          onClick={() => handleImageClick(imageUrl, index)}
                        >
                          <Eye className="h-6 w-6 mr-3" />
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