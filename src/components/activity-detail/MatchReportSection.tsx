
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, FileText, Youtube, ExternalLink } from "lucide-react";
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
  const [youtubeLink, setYoutubeLink] = useState(activity.youtubeLink || "");
  const [isSaving, setIsSaving] = useState(false);
  
  // Check if match should be considered historical - only check date
  const isMatchHistorical = () => {
    const matchDate = new Date(activity.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    // Match is historical if date is before today
    return matchDate < today;
  };
  
  // Show for all historical matches, regardless of results
  if (!isMatchHistorical()) return null;
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedActivity = {
        ...activity,
        matchReport: reportText.trim() || undefined,
        youtubeLink: youtubeLink.trim() || undefined
      };
      
      console.log("Saving match report and YouTube link:", {
        id: activity.id,
        matchReport: !!reportText.trim(),
        youtubeLink: !!youtubeLink.trim()
      });
      
      await updateActivity(updatedActivity);
      
      toast({
        title: "Matchreferat sparat",
        description: "Ditt matchreferat och YouTube-länk har sparats.",
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

  const hasContent = activity.matchReport || activity.youtubeLink;

  return (
    <Accordion type="single" collapsible defaultValue={hasContent ? "match-report" : undefined} className="border rounded-lg">
      <AccordionItem value="match-report" className="border-none">
        <AccordionTrigger className="px-4 py-3">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            <span>Matchreferat & Videoklipp</span>
            {!hasContent && (
              <Badge variant="outline" className="ml-2">
                Inget innehåll
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          {!isEditing && hasContent ? (
            <div className="space-y-4">
              {activity.matchReport && (
                <div>
                  <h4 className="font-medium mb-2">Matchreferat</h4>
                  <div className="whitespace-pre-wrap p-3 bg-muted/30 rounded-md text-sm">
                    {activity.matchReport}
                  </div>
                </div>
              )}
              {activity.youtubeLink && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <Youtube className="h-4 w-4 mr-1" />
                    Videoklipp
                  </h4>
                  <a 
                    href={activity.youtubeLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm break-all"
                  >
                    {activity.youtubeLink}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
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
                <label htmlFor="match-report" className="block text-sm font-medium mb-1">
                  Matchreferat
                </label>
                <Textarea
                  id="match-report"
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Skriv matchreferat här..."
                  className="min-h-[120px]"
                />
              </div>
              <div>
                <label htmlFor="youtube-link" className="block text-sm font-medium mb-1 flex items-center">
                  <Youtube className="h-4 w-4 mr-1" />
                  YouTube-länk
                </label>
                <Input
                  id="youtube-link"
                  type="url"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
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
