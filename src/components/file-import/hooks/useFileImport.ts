
import { useState } from "react";
import { Activity } from "@/types/player";
import { useToast } from "@/components/ui/use-toast";
import { parseActivitiesFromContent } from "../parseActivities";
import { parseCSVContent } from "../parsers/csvParser";
import { downloadCSVTemplate, downloadExportInstructions } from "../helpers/downloadHelpers";

interface UseFileImportProps {
  onActivitiesImported: (activities: Activity[]) => void;
}

export const useFileImport = ({ onActivitiesImported }: UseFileImportProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [importFormat, setImportFormat] = useState<"text" | "csv">("text");
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

        let activities: Activity[] = [];
        
        // Check if file is CSV based on extension or content
        const isCSV = file.name.toLowerCase().endsWith('.csv') || content.includes(',') && content.includes('\n');
        
        if (isCSV) {
          activities = parseCSVContent(content);
        } else {
          activities = parseActivitiesFromContent(content);
        }

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

  return {
    isLoading,
    importFormat,
    setImportFormat,
    handleFileUpload,
    downloadCSVTemplate,
    downloadExportInstructions
  };
};
