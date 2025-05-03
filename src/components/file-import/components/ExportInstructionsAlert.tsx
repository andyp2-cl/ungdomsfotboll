
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

interface ExportInstructionsAlertProps {
  onDownloadExportInstructions: () => void;
}

export function ExportInstructionsAlert({ onDownloadExportInstructions }: ExportInstructionsAlertProps) {
  return (
    <Alert className="bg-blue-50 text-blue-800 border-blue-300 mt-4">
      <AlertTriangle className="h-4 w-4 text-blue-800" />
      <AlertDescription className="text-sm">
        För att importera all din data behöver du exportera från tre tabeller: activities, players och player_activities.
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadExportInstructions}
            className="text-xs border-blue-400 hover:bg-blue-100"
          >
            <FileDown className="h-4 w-4 mr-1" /> Ladda ner instruktioner
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
