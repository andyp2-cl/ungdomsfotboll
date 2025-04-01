
import React from "react";
import { FileWarning } from "lucide-react";

interface FileUploadAreaProps {
  isLoading: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUploadArea({ isLoading, onFileChange }: FileUploadAreaProps) {
  return (
    <div className="flex items-center justify-center w-full">
      <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isLoading ? (
            <div className="mb-3 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">Importerar...</p>
            </div>
          ) : (
            <>
              <FileWarning className="w-8 h-8 mb-3 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Klicka för att ladda upp</span> eller dra och släpp
              </p>
              <p className="text-xs text-muted-foreground">TXT (Textfil)</p>
            </>
          )}
        </div>
        <input 
          id="file-upload" 
          type="file" 
          accept=".txt" 
          className="hidden" 
          onChange={onFileChange}
          disabled={isLoading}
        />
      </label>
    </div>
  );
}
