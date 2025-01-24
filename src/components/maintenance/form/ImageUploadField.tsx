import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ImageUploadFieldProps {
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedImages: File[];
  existingImages?: string[] | null;
}

export function ImageUploadField({ 
  onImageChange, 
  selectedImages,
  existingImages = [] 
}: ImageUploadFieldProps) {
  // Ensure existingImages is always an array
  const safeExistingImages = existingImages || [];
  
  return (
    <div className="space-y-4">
      <div>
        <FormLabel>Upload New Images</FormLabel>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={onImageChange}
          className="cursor-pointer mt-2"
        />
        {selectedImages.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">New Images to Upload</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedImages.map((file, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden border bg-gray-50">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Selected image ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {safeExistingImages.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Existing Request Images</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {safeExistingImages.map((imageUrl, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                <img
                  src={imageUrl}
                  alt={`Maintenance request image ${index + 1}`}
                  className="object-cover w-full h-full hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(imageUrl, '_blank')}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}