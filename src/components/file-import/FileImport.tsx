
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileUp } from "lucide-react";
import { ImportFormatSelector } from "./components/ImportFormatSelector";
import { ImportInstructions } from "./components/ImportInstructions";
import { FileUploadArea } from "./FileUploadArea";
import { ExportInstructionsAlert } from "./components/ExportInstructionsAlert";
import { useFileImport } from "./hooks/useFileImport";
import { Activity } from "@/types/player";

interface FileImportProps {
  onActivitiesImported: (activities: Activity[]) => void;
}

export function FileImport({ onActivitiesImported }: FileImportProps) {
  const { 
    isLoading, 
    importFormat, 
    setImportFormat, 
    handleFileUpload, 
    downloadCSVTemplate,
    downloadExportInstructions
  } = useFileImport({ onActivitiesImported });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          Importera från fil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImportFormatSelector 
          importFormat={importFormat} 
          setImportFormat={setImportFormat} 
        />
        
        <ImportInstructions 
          importFormat={importFormat} 
          onDownloadTemplate={downloadCSVTemplate} 
        />
        
        <FileUploadArea 
          isLoading={isLoading} 
          onFileChange={handleFileUpload} 
          acceptTypes={importFormat === "csv" ? ".csv" : ".txt"}
          fileType={importFormat === "csv" ? "CSV" : "TXT"}
        />
        
        <ExportInstructionsAlert 
          onDownloadExportInstructions={downloadExportInstructions} 
        />
      </CardContent>
      <CardFooter className="border-t pt-4 flex flex-col items-start">
        <p className="text-xs text-muted-foreground">
          <strong>Tips:</strong> För att exportera data från Supabase direkt, gå till Table Editor i Supabase Admin, välj tabellen och klicka på "..." och välj "Download CSV".
        </p>
      </CardFooter>
    </Card>
  );
}
