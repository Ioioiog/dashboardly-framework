import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageThumbnailProps {
  imageUrl: string;
  index: number;
  onView: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function ImageThumbnail({
  imageUrl,
  index,
  onView,
  onDelete,
  disabled = false,
}: ImageThumbnailProps) {
  const { toast } = useToast();

  return (
    <div className="relative aspect-square group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-full h-full">
        <img
          src={imageUrl}
          alt={`Uploaded image ${index + 1}`}
          className="rounded-lg object-cover w-full h-full transition-transform group-hover:scale-105"
          onError={() => {
            toast({
              title: "Error",
              description: "Failed to load image thumbnail",
              variant: "destructive"
            });
          }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            type="button"
            variant="secondary"
            size="xl"
            className="mr-2 px-8 py-6 text-lg"
            onClick={onView}
          >
            <Eye className="h-6 w-6 mr-3" />
            View
          </Button>
        </div>
      </div>
      {!disabled && (
        <button
          type="button"
          onClick={onDelete}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}