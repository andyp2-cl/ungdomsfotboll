
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UserCircle, Camera, Trash2 } from "lucide-react";

interface ImageUploadFieldProps {
  imagePreview: string | undefined;
  setImagePreview: (preview: string | undefined) => void;
}

export function ImageUploadField({ imagePreview, setImagePreview }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImagePreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center mb-4">
      <div className="relative mb-2">
        <div 
          className="h-24 w-24 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={handleImageClick}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Player" className="h-full w-full object-cover" />
          ) : (
            <UserCircle className="h-16 w-16 text-gray-400" />
          )}
          <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full">
            <Camera className="h-4 w-4" />
          </div>
        </div>
        {imagePreview && (
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white" 
            onClick={handleRemoveImage}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <span className="text-sm text-muted-foreground">Klicka för att lägga till bild</span>
    </div>
  );
}
