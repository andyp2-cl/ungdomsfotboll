
import React, { useState } from "react";
import { Activity, ActivityType } from "@/types/player";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AddActivityForm } from "@/components/AddActivityForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { CalendarPlus, FileText, Upload } from "lucide-react";
import { CupMatch, CupMatchesForm } from "@/components/CupMatchesForm";
import { generateFootballFieldUrl } from "@/utils/locationUtils";
import { parseActivitiesFromContent } from "@/components/file-import/parseActivities";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddActivity: (activity: Activity) => void;
}

export function AddActivityDialog({ 
  open, 
  onOpenChange, 
  onAddActivity 
}: AddActivityDialogProps) {
  const [textInput, setTextInput] = useState("");
  const [activeTab, setActiveTab] = useState<"form" | "text" | "import">("form");
  const [cupMatches, setCupMatches] = useState<CupMatch[]>([]);
  const [showCupMatches, setShowCupMatches] = useState(false);
  const [cupDate, setCupDate] = useState("");
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
    
    onOpenChange(false);
  };

  const handleActivityFormSave = (activity: Activity) => {
    if (activity.type === "cup" && showCupMatches && cupMatches.length > 0) {
      const cupActivity: Activity = {
        ...activity,
        matches: []
      };
      
      const matchActivities: Activity[] = cupMatches.map(match => ({
        id: match.id,
        name: match.name,
        date: activity.date,
        type: "match" as const,
        time: match.time,
        location: match.location ? {
          name: match.location,
          description: match.locationDescription,
          gpsLink: generateFootballFieldUrl(match.location)
        } : undefined,
        participants: [],
        cupId: cupActivity.id
      }));
      
      cupActivity.matches = matchActivities.map(match => match.id);
      
      onAddActivity(cupActivity);
      
      matchActivities.forEach(matchActivity => {
        onAddActivity(matchActivity);
      });
      
      toast({
        title: "Cup och matcher tillagda",
        description: `${activity.name} och ${matchActivities.length} matcher har lagts till.`,
      });
    } else {
      onAddActivity(activity);
    }
    
    setCupMatches([]);
    setShowCupMatches(false);
    setCupDate("");
    onOpenChange(false);
  };

  const handleActivityTypeChange = (type: ActivityType) => {
    setShowCupMatches(type === "cup");
  };

  const handleActivityDateChange = (date: string) => {
    setCupDate(date);
  };

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
          
          onOpenChange(false);
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
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        setCupMatches([]);
        setShowCupMatches(false);
        setCupDate("");
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lägg till aktivitet</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "form" | "text" | "import")}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <CalendarPlus className="h-4 w-4" />
              Formulär
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Textformat
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Fil
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <AddActivityForm 
              onSave={handleActivityFormSave}
              onCancel={() => onOpenChange(false)}
              onTypeChange={handleActivityTypeChange}
              onDateChange={handleActivityDateChange}
            />
            
            {showCupMatches && (
              <div className="mt-4 pt-4 border-t">
                <CupMatchesForm 
                  cupDate={cupDate}
                  onMatchesChange={setCupMatches}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="text">
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
                onClick={() => onOpenChange(false)}
              >
                Avbryt
              </Button>
              <Button onClick={handleSubmitText}>
                Lägg till
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="import">
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
                  onClick={() => onOpenChange(false)}
                >
                  Stäng
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
