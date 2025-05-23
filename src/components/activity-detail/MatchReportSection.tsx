
import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, FileText, Youtube } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  
  // Update local state when activity changes from parent
  useEffect(() => {
    setReportText(activity.matchReport || "");
    setYoutubeLink(activity.youtubeLink || "");
  }, [activity]);
  
  // Only show for historical activities
  if (!isHistorical) return null;
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedActivity = {
        ...activity,
        matchReport: reportText,
        youtubeLink: youtubeLink
      };
      
      console.log("Saving match report and YouTube link:", {
        activityId: activity.id,
        matchReport: reportText ? reportText.substring(0, 20) + "..." : "none",
        youtubeLink,
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

  const showYoutubePreview = !isEditing && activity.youtubeLink;
  
  // Helper function to determine if this is a valid YouTube link
  const isValidYoutubeLink = (link: string) => {
    return link && (
      link.includes("youtube.com") || 
      link.includes("youtu.be")
    );
  };
  
  // Extract YouTube video ID from link
  const getYoutubeVideoId = (link: string) => {
    if (!link) return null;
    
    // Check for YouTube full URL format (youtube.com/watch?v=ID)
    const fullUrlMatch = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }
    
    // Check for youtu.be short URL format
    const shortUrlMatch = link.match(/youtu\.be\/([^&\s]+)/);
    if (shortUrlMatch && shortUrlMatch[1]) {
      return shortUrlMatch[1];
    }
    
    return null;
  };

  return (
    <Accordion type="single" collapsible defaultValue={activity.matchReport || activity.youtubeLink ? "match-report" : undefined} className="border rounded-lg">
      <AccordionItem value="match-report" className="border-none">
        <AccordionTrigger className="px-4 py-3">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            <span>Matchreferat och video</span>
            {!activity.matchReport && !activity.youtubeLink && (
              <Badge variant="outline" className="ml-2">
                Inget referat
              </Badge>
            )}
            {activity.youtubeLink && (
              <Badge variant="secondary" className="ml-2">
                <Youtube className="h-3 w-3 mr-1" />
                Video
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
              
              {showYoutubePreview && isValidYoutubeLink(activity.youtubeLink) && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Youtube className="h-4 w-4 text-red-600" />
                    <Label className="font-medium">Match video</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={activity.youtubeLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm truncate"
                    >
                      {activity.youtubeLink}
                    </a>
                  </div>
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
                <Label htmlFor="matchReport" className="font-medium mb-2 block">Matchreferat</Label>
                <Textarea
                  id="matchReport"
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Skriv matchreferat här..."
                  className="min-h-[150px]"
                />
              </div>
              
              <div>
                <Label htmlFor="youtubeLink" className="font-medium mb-2 block">YouTube-länk till matchen</Label>
                <Input
                  id="youtubeLink"
                  type="url"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
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
