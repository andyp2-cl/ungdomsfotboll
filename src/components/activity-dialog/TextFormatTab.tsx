
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { parseActivitiesFromContent } from "@/components/file-import/parseActivities";

interface TextFormatTabProps {
  onAddActivity: (activity: Activity) => void;
  onClose: () => void;
}

export function TextFormatTab({ onAddActivity, onClose }: TextFormatTabProps) {
  const [textInput, setTextInput] = useState("");
  const { toast } = useToast();

  const handleSubmitText = () => {
    if (!textInput.trim()) {
      toast({
        variant: "destructive",
        title: "Tomt textfält",
        description: "Vänligen ange aktivitetsdata i textfältet.",
      });
      return;
    }

    const activities = parseActivitiesFromContent(textInput);
    
    if (activities.length === 0) {
      toast({
        variant: "destructive",
        title: "Kunde inte tolka data",
        description: "Inga giltiga aktiviteter hittades i texten. Kontrollera formatet.",
      });
      return;
    }

    for (const activity of activities) {
      onAddActivity(activity);
    }
    
    setTextInput("");
    
    toast({
      title: "Aktiviteter tillagda",
      description: `${activities.length} aktiviteter har lagts till.`,
    });
    
    onClose();
  };

  return (
    <>
      <DialogDescription className="pt-2 pb-4">
        Ange aktivitetsdata i följande format:
        <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-x-auto">
{`April
Lör 12
09:30
-Hässleholms IF svart - Vinslövs IF
Österås IP F-plan 7-manna 1
13:00
-Hässleholms IF svart - Hörby FF
Österås IP F-plan 7-manna 2`}
        </pre>
      </DialogDescription>
      
      <Textarea 
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Klistra in aktivitetsdata här..."
        className="min-h-[150px] font-mono text-sm"
      />
      
      <div className="flex justify-end gap-2 mt-4">
        <Button 
          variant="outline" 
          onClick={onClose}
        >
          Avbryt
        </Button>
        <Button onClick={handleSubmitText}>
          Lägg till
        </Button>
      </div>
    </>
  );
}
