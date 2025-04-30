
import React from "react";
import { ImagePreview } from "./image-upload/ImagePreview";
import { ImageEditorDialog } from "./image-upload/ImageEditorDialog";
import { useImageEditor } from "./image-upload/useImageEditor";

interface ZoomableImageUploadProps {
  imagePreview: string | undefined;
  setImagePreview: (preview: string | undefined) => void;
}

export function ZoomableImageUpload({ imagePreview, setImagePreview }: ZoomableImageUploadProps) {
  const {
    zoom,
    position,
    dragStart,
    imageSize,
    isEditing,
    originalImage,
    fileInputRef,
    canvasRef,
    setZoom,
    setPosition,
    setDragStart,
    setImageSize,
    setIsEditing,
    handleFileChange,
    handleImageClick,
    handleEditClick,
    handleRemoveImage,
    handleSave
  } = useImageEditor({ imagePreview, setImagePreview });

  return (
    <div className="flex flex-col items-center mb-4">
      <ImagePreview
        imagePreview={imagePreview}
        onImageClick={handleImageClick}
        onEditClick={handleEditClick}
        onRemoveImage={handleRemoveImage}
      />
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      <span className="text-sm text-muted-foreground">
        {imagePreview ? "Klicka för att ändra bild" : "Klicka för att lägga till bild"}
      </span>

      <ImageEditorDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        originalImage={originalImage}
        onSave={handleSave}
        zoom={zoom}
        setZoom={setZoom}
        position={position}
        setPosition={setPosition}
        dragStart={dragStart}
        setDragStart={setDragStart}
        imageSize={imageSize}
        setImageSize={setImageSize}
        canvasRef={canvasRef}
      />
    </div>
  );
}
