
import React from "react";
import { Button } from "@/components/ui/button";

interface ImportFormatSelectorProps {
  importFormat: "text" | "csv";
  setImportFormat: (format: "text" | "csv") => void;
}

export function ImportFormatSelector({ importFormat, setImportFormat }: ImportFormatSelectorProps) {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <Button 
        variant={importFormat === "text" ? "default" : "outline"}
        size="sm"
        onClick={() => setImportFormat("text")}
      >
        Textformat
      </Button>
      <Button 
        variant={importFormat === "csv" ? "default" : "outline"}
        size="sm"
        onClick={() => setImportFormat("csv")}
      >
        CSV-format
      </Button>
    </div>
  );
}
