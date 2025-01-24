import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ImageUploadFieldProps {
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectedImages: File[];
}

export function ImageUploadField({ onImageChange, selectedImages }: ImageUploadFieldProps) {
  return (
    <div className="space-y-2">
      <FormLabel>Images</FormLabel>
      <Input
        type="file"
        accept="image/*"
        multiple
        onChange={onImageChange}
        className="cursor-pointer"
      />
      {selectedImages.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedImages.length} image(s) selected
        </p>
      )}
    </div>
  );
}