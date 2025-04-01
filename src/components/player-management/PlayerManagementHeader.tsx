
import React from "react";
import { Grid, List, Plus } from "lucide-react";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface PlayerManagementHeaderProps {
  searchQuery: string;
  viewMode: "grid" | "list";
  onSearchChange: (value: string) => void;
  onViewModeChange: (mode: "grid" | "list") => void;
  onAddPlayerClick: () => void;
  isMobile: boolean;
}

export function PlayerManagementHeader({
  searchQuery,
  viewMode,
  onSearchChange,
  onViewModeChange,
  onAddPlayerClick,
  isMobile
}: PlayerManagementHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <div className="w-full md:w-1/2 xl:w-1/3">
        <SearchInput 
          value={searchQuery} 
          onChange={onSearchChange} 
          placeholder="Sök spelare..."
        />
      </div>
      <div className="flex items-center gap-2">
        {!isMobile && (
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => {
            if (value) onViewModeChange(value as "grid" | "list");
          }}>
            <ToggleGroupItem value="grid" aria-label="Rutnätsvy">
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Listvy">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        )}
        
        <Button onClick={onAddPlayerClick}>
          <Plus className="h-4 w-4 mr-2" />
          Lägg till spelare
        </Button>
      </div>
    </div>
  );
}
