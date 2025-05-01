
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useActivityState } from "@/hooks/activities/useActivityState";

export default function Header() {
  const { retryLoading, isLoading } = useActivityState();
  
  const handleRefresh = async () => {
    toast.loading("Uppdaterar data från servern...", {
      id: "header-refresh",
      duration: 3000
    });
    
    try {
      await retryLoading(true);
      toast.success("Data uppdaterad", {
        id: "header-refresh"
      });
    } catch (error) {
      toast.error("Kunde inte uppdatera data", {
        id: "header-refresh"
      });
      console.error("Error refreshing data:", error);
    }
  };

  return (
    <header className="bg-white border-b py-4 sticky top-0 z-40">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="text-lg font-semibold">Hässleholm IF</div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
          title="Uppdatera data från servern"
          className="flex items-center gap-1"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Uppdatera data
        </Button>
      </div>
    </header>
  );
}
