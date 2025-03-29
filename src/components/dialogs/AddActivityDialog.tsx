
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AddActivityForm } from "@/components/AddActivityForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { CalendarPlus, FileText } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"form" | "text">("form");
  const { toast } = useToast();

  const parseActivitiesFromContent = (content: string): Activity[] => {
    try {
      const lines = content.split('\n').filter(line => line.trim().length > 0);
      const activities: Activity[] = [];
      
      let currentMonth = "";
      let currentYear = new Date().getFullYear().toString();
      let currentDate = "";
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if this is a month line
        if (line.match(/^[A-Za-zåäöÅÄÖ]+$/)) {
          currentMonth = line;
          continue;
        }
        
        // Check if this is a date line (e.g. "Lör 12")
        const dateMatch = line.match(/^([A-Za-zåäöÅÄÖ]+)\s+(\d+)$/);
        if (dateMatch) {
          const day = dateMatch[2].padStart(2, '0');
          const monthMap: {[key: string]: string} = {
            "Januari": "01", "Februari": "02", "Mars": "03", "April": "04",
            "Maj": "05", "Juni": "06", "Juli": "07", "Augusti": "08",
            "September": "09", "Oktober": "10", "November": "11", "December": "12",
            "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", 
            "Jun": "06", "Jul": "07", "Aug": "08", 
            "Sep": "09", "Okt": "10", "Nov": "11", "Dec": "12"
          };
          
          const monthNumber = monthMap[currentMonth] || "01"; // Default to January if unknown
          currentDate = `${currentYear}-${monthNumber}-${day}`;
          continue;
        }
        
        // Check if this is a match line (starts with time)
        const matchLineMatch = line.match(/^(\d{2}:\d{2})\s*-(.+)$/);
        if (matchLineMatch && currentDate) {
          const time = matchLineMatch[1].trim();
          const matchName = matchLineMatch[2].trim();
          
          // Get location from next line if available
          let location = "";
          let locationDesc = "";
          
          if (i + 1 < lines.length && !lines[i + 1].match(/^(\d{2}:\d{2})|([A-Za-zåäöÅÄÖ]+\s+\d+)$/) && !lines[i + 1].match(/^[A-Za-zåäöÅÄÖ]+$/)) {
            const locationLine = lines[i + 1].trim();
            
            // Try to split location and description if possible
            const locationParts = locationLine.split(/\s+(?=[A-Za-zåäöÅÄÖ]-plan)/);
            
            if (locationParts.length > 1) {
              location = locationParts[0].trim();
              locationDesc = locationParts[1].trim();
            } else {
              location = locationLine;
            }
            
            i++; // Skip the location line in the next iteration
          }
          
          // Determine if it's a cup or match
          const type = matchName.toLowerCase().includes('cup') ? 'cup' : 'match';
          
          // Create activity object
          const activity: Activity = {
            id: uuidv4(),
            name: matchName,
            date: currentDate,
            time: time,
            type: type,
            participants: [],
          };
          
          // Add location if available
          if (location) {
            activity.location = {
              name: location,
              description: locationDesc,
            };
          }
          
          activities.push(activity);
        }
      }
      
      return activities;
    } catch (error) {
      console.error("Error parsing activities:", error);
      return [];
    }
  };

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

    // For now we only add the first activity (single activity mode)
    onAddActivity(activities[0]);
    setTextInput("");
    
    toast({
      title: "Aktivitet tillagd",
      description: `${activities[0].name} har lagts till.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lägg till ny aktivitet</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "form" | "text")}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <CalendarPlus className="h-4 w-4" />
              Formulär
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Textformat
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <AddActivityForm 
              onSave={(activity) => {
                onAddActivity(activity);
                onOpenChange(false);
              }}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>
          
          <TabsContent value="text">
            <DialogDescription className="pt-2 pb-4">
              Ange aktivitetsdata i följande format:
              <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-x-auto">
{`April
Lör 12
09:30 -Hässleholms IF svart - Vinslövs IF
Österås IP F-plan 7-manna 1`}
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
