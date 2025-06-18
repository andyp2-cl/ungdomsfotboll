import React from "react";
import { Player, Activity } from "@/types/player";
import { PlayerListTable } from "./PlayerListTable";
import { PlayerGridView } from "./PlayerGridView";
import { usePlayerSorting } from "./PlayerListSorting";
import { useIsMobile } from "@/hooks/use-mobile";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";
import { calculateDevelopmentValue } from "./PlayerListSorting";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings2 } from "lucide-react";

interface PlayerListProps {
  players: Player[];
  viewMode?: "grid" | "list";
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
  showCoaches?: boolean;
  activities?: Activity[];
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}

export function PlayerList({ 
  players, 
  viewMode = "list", 
  onPlayerSelect, 
  onPlayerEdit,
  showCoaches = true,
  activities = [],
  searchQuery = "",
  onSearchChange
}: PlayerListProps) {
  const [selectedGrades, setSelectedGrades] = React.useState<string[]>([]);
  const { sortField, sortDirection, toggleSort } = usePlayerSorting();
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>([
    'name',
    'grade',
    'position',
    'activities',
    'winrate',
    'goalsPerMatch',
    'teammates',
    'development',
    'form'
  ]);

  const grades = ['A', 'B', 'C', 'D'];

  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev => {
      if (prev.includes(grade)) {
        return prev.filter(g => g !== grade);
      }
      return [...prev, grade];
    });
  };

  const filteredPlayers = React.useMemo(() => {
    return players.filter(player => {
      // Filter by selected grades
      const matchesGrade = selectedGrades.length === 0 || selectedGrades.includes(player.grade || '');
      
      // Filter coaches if needed
      const isCoach = player.positions?.includes('TR');
      const showPlayer = showCoaches ? true : !isCoach;
      
      return matchesGrade && showPlayer;
    });
  }, [players, selectedGrades, showCoaches]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <Input
            type="text"
            placeholder="Sök spelare..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="max-w-[300px]"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtrera nivå:</span>
            {grades.map((grade) => (
              <Button
                key={grade}
                variant={selectedGrades.includes(grade) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleGrade(grade)}
              >
                {grade}
              </Button>
            ))}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings2 className="h-4 w-4 mr-2" />
              Kolumner
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[
              { id: 'grade', label: 'Nivå' },
              { id: 'position', label: 'Position' },
              { id: 'activities', label: 'Aktiviteter' },
              { id: 'winrate', label: 'Vinstprocent' },
              { id: 'goalsPerMatch', label: 'Mål/match' },
              { id: 'teammates', label: 'Medspelare' },
              { id: 'development', label: 'Utveckling' },
              { id: 'form', label: 'Form' }
            ].map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={visibleColumns.includes(column.id)}
                onCheckedChange={(checked) => {
                  setVisibleColumns(prev => 
                    checked 
                      ? [...prev, column.id]
                      : prev.filter(id => id !== column.id)
                  );
                }}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <PlayerListTable 
        players={filteredPlayers} 
        activities={activities}
        sortField={sortField} 
        sortDirection={sortDirection} 
        toggleSort={toggleSort} 
        onPlayerSelect={onPlayerSelect} 
        onPlayerEdit={onPlayerEdit}
        visibleColumns={visibleColumns}
      />
    </div>
  );
}
