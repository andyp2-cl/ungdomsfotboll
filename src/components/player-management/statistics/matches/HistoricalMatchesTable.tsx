
import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPin, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  formatter?: (value: any, activity: Activity) => React.ReactNode;
}

interface HistoricalMatchesTableProps {
  historicalMatches: Activity[];
  onActivitySelect?: (activity: Activity) => void;
  className?: string;
  maxHeight?: string;
  players?: Player[];
}

export function HistoricalMatchesTable({
  historicalMatches,
  onActivitySelect,
  className = "",
  maxHeight = "400px",
  players = []
}: HistoricalMatchesTableProps) {
  // State for sorting
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({
    key: 'date',
    direction: 'descending'
  });

  // State for expanded row
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Map to convert league IDs to user-friendly names
  const leagueMapping: Record<string, string> = {
    "ff3ff744-b580-4b63-80b2-81fd221cf4b5": "2013 A1",
    "d357e856-7bcb-4fa5-96ef-0cfb596978b4": "2014 A1",
    "5ba8c989-c9a2-41bc-8fd7-d3a7669a1c86": "2014 A2",
    "7f764d0c-967b-407c-8aa6-225477a6b560": "2014 B1"
  };

  // Define table columns
  const columns: Column[] = [
    {
      key: 'date',
      label: 'Datum',
      sortable: true,
      formatter: (value, activity) => (
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(value).toLocaleDateString('sv-SE')}</span>
        </div>
      )
    },
    {
      key: 'name',
      label: 'Match',
      sortable: true
    },
    {
      key: 'league_id',
      label: 'Liga',
      sortable: true,
      formatter: (value, activity) => {
        if (!value) return null;
        // Use the mapping to convert league_id to user-friendly format
        const leagueName = leagueMapping[value] || `Liga ${value.substring(0, 8)}`;
        return <Badge variant="outline">{leagueName}</Badge>;
      }
    },
    {
      key: 'result',
      label: 'Resultat',
      sortable: true,
      formatter: (_, activity) => (
        <div className={cn(
          "font-bold",
          activity.isWin ? "text-green-600" : 
          activity.isWin === false ? "text-red-600" : 
          "text-yellow-600"
        )}>
          {activity.homeScore}-{activity.awayScore}
        </div>
      )
    },
    {
      key: 'location',
      label: 'Plats',
      formatter: (_, activity) => (
        <div className="flex items-center gap-2">
          {activity.location?.name && (
            <>
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{activity.location.name}</span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'homeScore',
      label: 'Mål gjorda',
      sortable: true,
      formatter: (value) => <span className="font-medium">{value || 0}</span>
    },
    {
      key: 'awayScore',
      label: 'Mål insläppta',
      sortable: true,
      formatter: (value) => <span className="font-medium">{value || 0}</span>
    },
    {
      key: 'matchReport',
      label: 'Matchrapport',
      formatter: (value) => value ? (
        <Badge variant="success">Rapport</Badge>
      ) : null
    }
  ];

  // Sorting function
  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  // Get sorted data
  const sortedMatches = React.useMemo(() => {
    const sortableMatches = [...historicalMatches];
    
    if (sortConfig.key) {
      sortableMatches.sort((a: any, b: any) => {
        // Special case for dates - parse as Date objects
        if (sortConfig.key === 'date') {
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);
          
          if (sortConfig.direction === 'ascending') {
            return dateA.getTime() - dateB.getTime();
          } 
          return dateB.getTime() - dateA.getTime();
        }
        
        // Normal string/number comparison
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableMatches;
  }, [historicalMatches, sortConfig]);

  // Handle row click
  const handleRowClick = (activity: Activity) => {
    if (expandedRowId === activity.id) {
      setExpandedRowId(null);
    } else {
      setExpandedRowId(activity.id);
      if (onActivitySelect) {
        onActivitySelect(activity);
      }
    }
  };

  // Find player by ID
  const getPlayerById = (playerId: string) => {
    return players.find(player => player.id === playerId);
  };

  // Render expanded row content with player details
  const renderExpandedContent = (activity: Activity) => {
    // Get the participants who played in this match
    const participantPlayers = activity.participants?.map(playerId => 
      getPlayerById(playerId)
    ).filter(Boolean) || [];

    return (
      <div className="p-4 bg-muted/30 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Matchdetaljer</h4>
            {activity.matchReport && (
              <div className="text-sm mb-2">{activity.matchReport}</div>
            )}
            {!activity.matchReport && (
              <div className="text-sm text-muted-foreground">Ingen matchrapport tillgänglig</div>
            )}
          </div>
          <div>
            <h4 className="font-medium mb-2">Laguppställning</h4>
            {participantPlayers.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {participantPlayers.map(player => (
                  <div key={player?.id} className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-md">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={player?.image} alt={player?.name} />
                      <AvatarFallback>{player?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{player?.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {activity.participants && activity.participants.length > 0 ? 
                  `${activity.participants.length} spelare deltog` : 
                  'Ingen deltagardata tillgänglig'}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              if (onActivitySelect) onActivitySelect(activity);
            }}
          >
            Visa detaljer
          </Button>
        </div>
      </div>
    );
  };

  if (historicalMatches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Inga matcher att visa
      </div>
    );
  }

  return (
    <div className={cn("border rounded-md", className)}>
      <ScrollArea className="w-full h-[500px]">
        <div className="min-w-full">
          <Table>
            <TableHeader className="bg-background sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-10"></TableHead> {/* Expansion column */}
                {columns.map((column) => (
                  <TableHead 
                    key={column.key}
                    className={cn(
                      column.sortable && "cursor-pointer hover:bg-muted/50",
                      "whitespace-nowrap"
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.sortable && sortConfig.key === column.key && (
                        <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMatches.map((match) => (
                <React.Fragment key={match.id}>
                  <TableRow 
                    className={cn(
                      "cursor-pointer hover:bg-muted/50",
                      expandedRowId === match.id && "bg-muted/30"
                    )}
                    onClick={() => handleRowClick(match)}
                  >
                    <TableCell className="w-10">
                      {expandedRowId === match.id ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={`${match.id}-${column.key}`} className="whitespace-nowrap py-2">
                        {column.formatter 
                          ? column.formatter((match as any)[column.key], match)
                          : (match as any)[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRowId === match.id && (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="p-0 border-t-0">
                        {renderExpandedContent(match)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
