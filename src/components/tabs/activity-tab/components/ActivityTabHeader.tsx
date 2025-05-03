
import { Button } from "@/components/ui/button";
import { RefreshCcw, LayoutGrid, Calendar, BarChart3, Wrench } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";

export interface ActivityTabHeaderProps {
  activeView: "current" | "historical" | "statistics" | "tools";
  handleViewChange: (view: "current" | "historical" | "statistics" | "tools") => void;
  setIsAddActivityOpen: (isOpen: boolean) => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  isMobile: boolean;
  onImportClick?: () => void; 
  onBackupClick?: () => void;
  onRestoreClick?: () => void;
}

export function ActivityTabHeader({ 
  activeView, 
  handleViewChange, 
  onRefresh, 
  isRefreshing,
  isMobile,
  onImportClick,
  onBackupClick,
  onRestoreClick
}: ActivityTabHeaderProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Aktiviteter</h2>
      
      <ToggleGroup 
        type="single" 
        value={activeView} 
        onValueChange={(value) => {
          if (value) handleViewChange(value as any);
        }}
        className={`${isMobile ? 'justify-center w-full text-xs' : ''}`}
      >
        <ToggleGroupItem value="current" aria-label="Visa nuvarande aktiviteter" className={`${isMobile ? 'text-xs' : ''}`}>
          <Calendar className={`${isMobile ? 'h-4 w-4 mr-1' : 'h-4 w-4 mr-2'}`} />
          {!isMobile ? 'Nuvarande' : 'Nu'}
        </ToggleGroupItem>
        <ToggleGroupItem value="historical" aria-label="Visa historiska aktiviteter" className={`${isMobile ? 'text-xs' : ''}`}>
          <LayoutGrid className={`${isMobile ? 'h-4 w-4 mr-1' : 'h-4 w-4 mr-2'}`} />
          {!isMobile ? 'Historiska' : 'Hist.'}
        </ToggleGroupItem>
        <ToggleGroupItem value="statistics" aria-label="Visa statistik" className={`${isMobile ? 'text-xs' : ''}`}>
          <BarChart3 className={`${isMobile ? 'h-4 w-4 mr-1' : 'h-4 w-4 mr-2'}`} />
          {!isMobile ? 'Statistik' : 'Stats'}
        </ToggleGroupItem>
        <ToggleGroupItem value="tools" aria-label="Visa verktyg" className={`${isMobile ? 'text-xs' : ''}`}>
          <Wrench className={`${isMobile ? 'h-4 w-4 mr-1' : 'h-4 w-4 mr-2'}`} />
          {!isMobile ? 'Verktyg' : 'Tools'}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
