
import { useState, useRef } from "react";
import { ZoomableImageUpload } from "./ZoomableImageUpload";

interface ImageUploadFieldProps {
  imagePreview: string | undefined;
  setImagePreview: (preview: string | undefined) => void;
}

export function ImageUploadField({ imagePreview, setImagePreview }: ImageUploadFieldProps) {
  return (
    <ZoomableImageUpload
      imagePreview={imagePreview}
      setImagePreview={setImagePreview}
    />
  );
}
