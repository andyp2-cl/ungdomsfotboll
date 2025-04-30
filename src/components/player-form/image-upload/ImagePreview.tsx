
import React from "react";
import { Button } from "@/components/ui/button";
import { UserCircle, Camera, ZoomIn } from "lucide-react";

interface ImagePreviewProps {
  imagePreview: string | undefined;
  onImageClick: () => void;
  onEditClick: (e: React.MouseEvent) => void;
  onRemoveImage: (e: React.MouseEvent) => void;
}

export function ImagePreview({
  imagePreview,
  onImageClick,
  onEditClick,
  onRemoveImage
}: ImagePreviewProps) {
  return (
    <div className="relative mb-2">
      <div 
        className="h-24 w-24 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors"
        onClick={onImageClick}
      >
        {imagePreview ? (
          <img src={imagePreview} alt="Player" className="h-full w-full object-cover" />
        ) : (
          <UserCircle className="h-16 w-16 text-gray-400" />
        )}
        <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full">
          <Camera className="h-4 w-4" />
        </div>

        {imagePreview && (
          <div className="absolute bottom-0 left-0 bg-primary text-white p-1 rounded-full" onClick={onEditClick}>
            <ZoomIn className="h-4 w-4" />
          </div>
        )}
      </div>
      {imagePreview && (
        <Button 
          type="button" 
          variant="outline" 
          size="icon" 
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white" 
          onClick={onRemoveImage}
        >
          <span className="sr-only">Remove image</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="h-3 w-3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      )}
    </div>
  );
}
