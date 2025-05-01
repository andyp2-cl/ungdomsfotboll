
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart2 } from "lucide-react";

interface ActivityTabHeaderProps {
  activeView: string;
  handleViewChange: (value: string) => void;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  isMobile?: boolean;
}

export function ActivityTabHeader({
  activeView,
  handleViewChange,
  setIsAddActivityOpen,
  isMobile = false
}: ActivityTabHeaderProps) {
  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Aktiviteter</h2>
        <div className="flex items-center gap-2">
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
