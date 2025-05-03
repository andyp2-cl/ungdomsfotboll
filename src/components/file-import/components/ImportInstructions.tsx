
import React from "react";
import { Table } from "lucide-react";
import { ImportFormatExample } from "../ImportFormatExample";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

interface ImportInstructionsProps {
  importFormat: "text" | "csv";
  onDownloadTemplate: () => void;
}

export function ImportInstructions({ importFormat, onDownloadTemplate }: ImportInstructionsProps) {
  return (
    <div>
      {importFormat === "text" ? (
        <div>
          <p className="text-sm text-muted-foreground">
            Ladda upp en textfil med aktiviteter i följande format:
            <br />
            <ImportFormatExample />
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Ladda upp en CSV-fil exporterad från Supabase med följande kolumner:
          </p>
          <div className="bg-muted p-2 rounded text-xs mt-1 overflow-x-auto">
            <Table className="h-4 w-4 mr-1 inline-block" /> <code>id, name, date, type, time, location_name, location_description, location_gps_link, cup_id</code>
          </div>
          <div className="mt-2 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDownloadTemplate}
              className="text-xs"
            >
              <FileDown className="h-4 w-4 mr-1" /> Ladda ner CSV-mall
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
