import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImagePreviewDialogProps {
  selectedImage: string | null;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  totalImages: number;
  currentIndex: number;
}

export function ImagePreviewDialog({
  selectedImage,
  onClose,
  onPrevious,
  onNext,
  totalImages,
  currentIndex,
}: ImagePreviewDialogProps) {
  const { toast } = useToast();

  if (!selectedImage) return null;

  return (
    <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0 overflow-hidden bg-black/90">
      <DialogTitle className="p-8 text-white flex items-center justify-between">
        <span className="text-xl">Image Preview ({currentIndex + 1} of {totalImages})</span>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </DialogTitle>
      <div className="relative flex items-center justify-center h-[calc(90vh-5rem)]">
        <img
          src={selectedImage}
          alt="Maintenance request"
          className="max-h-[85vh] max-w-[90vw] object-contain"
          onError={() => {
            toast({
              title: "Error",
              description: "Failed to load image",
              variant: "destructive"
            });
          }}
        />
        {totalImages > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 text-white hover:bg-white/20"
              onClick={onPrevious}
            >
              <ChevronLeft className="h-12 w-12" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 text-white hover:bg-white/20"
              onClick={onNext}
            >
              <ChevronRight className="h-12 w-12" />
            </Button>
          </>
        )}
      </div>
    </DialogContent>
  );
}