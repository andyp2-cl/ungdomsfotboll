
import { useState } from "react";
import { Activity } from "@/types/player";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { ImportFormatExample } from "./ImportFormatExample";
import { FileUploadArea } from "./FileUploadArea";
import { parseActivitiesFromContent } from "./parseActivities";

interface FileImportProps {
  onActivitiesImported: (activities: Activity[]) => void;
}

export function FileImport({ onActivitiesImported }: FileImportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) throw new Error("Kunde inte läsa filinnehållet");

        const activities = parseActivitiesFromContent(content);

        if (activities.length === 0) {
          toast({
            variant: "destructive",
            title: "Fel vid import",
            description: "Inga giltiga aktiviteter hittades i filen.",
          });
        } else {
          onActivitiesImported(activities);
          toast({
            title: "Import slutförd",
            description: `${activities.length} aktiviteter har importerats.`,
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Fel vid import",
          description: "Ett fel uppstod vid import av aktiviteter.",
        });
        console.error("Error importing activities:", error);
      } finally {
        setIsLoading(false);
        // Reset file input
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Fel vid import",
        description: "Kunde inte läsa filen.",
      });
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importera från fil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Ladda upp en textfil med aktiviteter i följande format:
          <br />
          <ImportFormatExample />
        </p>
        
        <FileUploadArea 
          isLoading={isLoading} 
          onFileChange={handleFileUpload} 
        />
      </CardContent>
    </Card>
  );
}
