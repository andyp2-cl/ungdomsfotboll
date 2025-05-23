
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, FileText } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface MatchReportSectionProps {
  activity: Activity;
  updateActivity: (activity: Activity) => Promise<void>;
  isHistorical: boolean;
}

export function MatchReportSection({ 
  activity, 
  updateActivity,
  isHistorical
}: MatchReportSectionProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [reportText, setReportText] = useState(activity.matchReport || "");
  const [isSaving, setIsSaving] = useState(false);
  
  // Only show for historical activities
  if (!isHistorical) return null;
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateActivity({
        ...activity,
        matchReport: reportText
      });
      
      toast({
        title: "Matchreferat sparat",
        description: "Ditt matchreferat har sparats.",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving match report:", error);
      toast({
        title: "Kunde inte spara",
        description: "Ett fel uppstod när matchreferatet skulle sparas.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Accordion type="single" collapsible defaultValue={activity.matchReport ? "match-report" : undefined} className="border rounded-lg">
      <AccordionItem value="match-report" className="border-none">
        <AccordionTrigger className="px-4 py-3">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            <span>Matchreferat</span>
            {!activity.matchReport && (
              <Badge variant="outline" className="ml-2">
                Inget referat
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          {!isEditing && activity.matchReport ? (
            <div className="space-y-4">
              <div className="whitespace-pre-wrap p-3 bg-muted/30 rounded-md">
                {activity.matchReport}
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                size="sm"
              >
                Redigera referat
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Skriv matchreferat här..."
                className="min-h-[150px]"
              />
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Sparar..." : "Spara referat"}
                </Button>
                {isEditing && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setReportText(activity.matchReport || "");
                      setIsEditing(false);
                    }}
                  >
                    Avbryt
                  </Button>
                )}
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
