
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
import { CalendarIcon, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
}

export function HistoricalMatchesTable({
  historicalMatches,
  onActivitySelect,
  className = "",
  maxHeight = "400px"
}: HistoricalMatchesTableProps) {
  // State for sorting
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({
    key: 'date',
    direction: 'descending'
  });

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
      formatter: (value) => value ? <Badge variant="outline">Liga</Badge> : null
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
    if (onActivitySelect) {
      onActivitySelect(activity);
    }
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
      <ScrollArea className={cn("w-full", maxHeight ? `max-h-[${maxHeight}]` : "")}>
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
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
              <TableRow 
                key={match.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50",
                  onActivitySelect && "cursor-pointer"
                )}
                onClick={() => handleRowClick(match)}
              >
                {columns.map((column) => (
                  <TableCell key={`${match.id}-${column.key}`} className="whitespace-nowrap py-2">
                    {column.formatter 
                      ? column.formatter((match as any)[column.key], match)
                      : (match as any)[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
