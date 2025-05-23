
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, FileText, Youtube } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

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
  const [youtubeLink, setYoutubeLink] = useState(activity.youtubeLink || "");
  const [isSaving, setIsSaving] = useState(false);
  
  // Only show for historical activities
  if (!isHistorical) return null;
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateActivity({
        ...activity,
        matchReport: reportText,
        youtubeLink: youtubeLink
      });
      
      toast({
        title: "Matchreferat sparat",
        description: "Ditt matchreferat och videolänk har sparats.",
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

  const renderYoutubeLink = () => {
    if (!activity.youtubeLink) return null;
    
    return (
      <div className="mt-2">
        <a 
          href={activity.youtubeLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <Youtube className="h-4 w-4 mr-1" />
          Se matchvideo
        </a>
      </div>
    );
  };

  return (
    <Accordion type="single" collapsible defaultValue={activity.matchReport || activity.youtubeLink ? "match-report" : undefined} className="border rounded-lg">
      <AccordionItem value="match-report" className="border-none">
        <AccordionTrigger className="px-4 py-3">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            <span>Matchreferat & Video</span>
            {!activity.matchReport && !activity.youtubeLink && (
              <Badge variant="outline" className="ml-2">
                Finns ej
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          {!isEditing && (activity.matchReport || activity.youtubeLink) ? (
            <div className="space-y-4">
              {activity.matchReport && (
                <div className="whitespace-pre-wrap p-3 bg-muted/30 rounded-md">
                  {activity.matchReport}
                </div>
              )}
              
              {renderYoutubeLink()}
              
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                size="sm"
              >
                Redigera
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="matchReport" className="text-sm font-medium mb-1 block">
                  Matchreferat
                </label>
                <Textarea
                  id="matchReport"
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Skriv matchreferat här..."
                  className="min-h-[150px]"
                />
              </div>
              
              <div>
                <label htmlFor="youtubeLink" className="text-sm font-medium mb-1 block">
                  YouTube-länk
                </label>
                <Input
                  id="youtubeLink"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <span className="text-xs text-muted-foreground mt-1 block">
                  Länk till matchvideo på YouTube
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Sparar..." : "Spara"}
                </Button>
                {isEditing && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setReportText(activity.matchReport || "");
                      setYoutubeLink(activity.youtubeLink || "");
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
