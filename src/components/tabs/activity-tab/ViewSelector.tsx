
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BarChart3, Calendar, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ViewSelectorProps {
  activeView: "upcoming" | "historical" | "statistics";
  onViewChange: (value: "upcoming" | "historical" | "statistics") => void;
}

export function ViewSelector({ activeView, onViewChange }: ViewSelectorProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'w-full overflow-x-auto pb-2' : 'w-full sm:w-auto space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4'}`}>
      <ToggleGroup 
        type="single" 
        value={activeView} 
        onValueChange={(value) => value && onViewChange(value as "upcoming" | "historical" | "statistics")} 
        className={`justify-start ${isMobile ? 'w-full flex' : ''}`}
      >
        <ToggleGroupItem value="upcoming" aria-label="Kommande aktiviteter" className={isMobile ? 'flex-1 py-1.5 px-2 text-xs' : ''}>
          <Calendar className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          {isMobile ? 'Kommande' : 'Kommande'}
        </ToggleGroupItem>
        <ToggleGroupItem value="historical" aria-label="Historiska aktiviteter" className={isMobile ? 'flex-1 py-1.5 px-2 text-xs' : ''}>
          <Clock className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          {isMobile ? 'Historik' : 'Historik'}
        </ToggleGroupItem>
        <ToggleGroupItem value="statistics" aria-label="Statistik" className={isMobile ? 'flex-1 py-1.5 px-2 text-xs' : ''}>
          <BarChart3 className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          {isMobile ? 'Statistik' : 'Statistik'}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
