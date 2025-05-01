
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ActivityTabHeaderProps {
  activeView: string;
  handleViewChange: (value: string) => void;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  onRefresh?: () => void; // Refresh callback
  isMobile?: boolean;
  isRefreshing?: boolean;
}

export function ActivityTabHeader({
  activeView,
  handleViewChange,
  setIsAddActivityOpen,
  onRefresh,
  isMobile = false,
  isRefreshing = false
}: ActivityTabHeaderProps) {
  const handleRefresh = () => {
    if (onRefresh) {
      toast.info("Uppdaterar data från servern...");
      onRefresh();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Aktiviteter</h2>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Uppdatera data från servern"
              aria-label="Uppdatera data från servern"
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {!isMobile && "Uppdatera data"}
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={() => setIsAddActivityOpen(true)}
            aria-label="Lägg till aktivitet"
          >
            <Plus className="h-4 w-4 mr-1" />
            {!isMobile && "Ny aktivitet"}
          </Button>
        </div>
      </div>
      <Tabs
        value={activeView}
        onValueChange={handleViewChange}
        className="w-full"
      >
        <TabsList className="w-full">
          <TabsTrigger value="historical" className="flex-1">
            Tidigare
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1">
            Kommande
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex-1">
            <BarChart2 className="h-4 w-4 mr-2" />
            {!isMobile && "Statistik"}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
