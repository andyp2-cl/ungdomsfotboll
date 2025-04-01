
import React from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseActivitiesFromContent } from "@/components/file-import/parseActivities";

interface FileImportTabProps {
  onAddActivity: (activity: Activity) => void;
  onClose: () => void;
}

export function FileImportTab({ onAddActivity, onClose }: FileImportTabProps) {
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
          activities.forEach(activity => {
            onAddActivity(activity);
          });
          
          toast({
            title: "Import slutförd",
            description: `${activities.length} aktiviteter har importerats.`,
          });
          
          onClose();
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Fel vid import",
          description: "Ett fel uppstod vid import av aktiviteter.",
        });
        console.error("Error importing activities:", error);
      } finally {
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
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <DialogDescription>
        Importera aktiviteter från en textfil i samma format som i textfliken.
      </DialogDescription>
      
      <div className="flex items-center justify-center w-full">
        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Klicka för att ladda upp</span> eller dra och släpp
            </p>
            <p className="text-xs text-muted-foreground">TXT (Textfil)</p>
          </div>
          <input 
            id="file-upload" 
            type="file" 
            accept=".txt" 
            className="hidden" 
            onChange={handleFileUpload}
          />
        </label>
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={onClose}
        >
          Stäng
        </Button>
      </div>
    </div>
  );
}
