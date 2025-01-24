import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ImageUploadFieldProps {
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedImages: File[];
  existingImages?: string[];
}

export function ImageUploadField({ 
  onImageChange, 
  selectedImages,
  existingImages = [] 
}: ImageUploadFieldProps) {
  return (
    <div className="space-y-2">
      <FormLabel>Images</FormLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={onImageChange}
            className="cursor-pointer"
          />
          {selectedImages.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedImages.length} new image(s) selected
            </p>
          )}
        </div>
        
        {existingImages.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Existing Images</p>
            <div className="grid grid-cols-2 gap-2">
              {existingImages.map((imageUrl, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                  <img
                    src={imageUrl}
                    alt={`Maintenance request image ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}