import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { restoreCuper } from "@/lib/supabase/activities";

export function RestoreCuperButton() {
  const { toast } = useToast();
  const [isRestoring, setIsRestoring] = useState(false);
  
  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const success = await restoreCuper();
      
      if (success) {
        toast({
          title: "Cuper återställd",
          description: "Cuper och dess aktiviteter har återställts.",
        });
        // Force reload the page to reflect changes
        window.location.reload();
      } else {
        toast({
          title: "Återställning misslyckades",
          description: "Kunde inte återställa Cuper. Se konsolen för mer information.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error restoring Cuper:", error);
      toast({
        title: "Återställning misslyckades",
        description: `Ett fel uppstod: ${error instanceof Error ? error.message : 'Okänt fel'}`,
        variant: "destructive"
      });
    } finally {
      setIsRestoring(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-2"
      onClick={handleRestore}
      disabled={isRestoring}
    >
      {isRestoring ? <Spinner className="h-4 w-4" /> : <Trophy className="h-4 w-4" />}
      Återställ Cuper
    </Button>
  );
} 