
import React, { useState } from 'react';
import { Player, Activity } from "@/types/player";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from '../utils/date-formatter';
import { MatchPreview } from './MatchPreview';

interface MatchesTabContentProps {
  player: Player;
  matches: Activity[];
  onActivitySelect: (activity: Activity) => void;
  allPlayers?: Player[];
}

export function MatchesTabContent({ player, matches, onActivitySelect, allPlayers = [] }: MatchesTabContentProps) {
  const [selectedMatch, setSelectedMatch] = useState<Activity | null>(null);

  // Helper function to format match result
  const formatResult = (match: Activity) => {
    if (match.homeScore !== undefined && match.awayScore !== undefined && 
        match.homeScore !== null && match.awayScore !== null) {
      return `${match.homeScore}-${match.awayScore}`;
    }
    if (match.result && !match.result.includes('null') && !match.result.includes('undefined')) {
      return match.result;
    }
    return null;
  };
  
  // Helper to determine badge color based on match outcome
  const getResultBadgeClass = (match: Activity) => {
    // For draw
    if (match.homeScore === match.awayScore && 
        match.homeScore !== undefined && 
        match.awayScore !== undefined) {
      return "bg-gray-100 text-gray-800 border-gray-300";
    }
    
    // For win/loss based on isWin property
    if (match.isWin === true) {
      return "bg-green-100 text-green-800 border-green-300";
    } else if (match.isWin === false) {
      return "bg-red-100 text-red-800 border-red-300";
    }
    
    // Default fallback
    return "bg-blue-100 text-blue-800 border-blue-300";
  };

  const handleRowClick = (match: Activity) => {
    setSelectedMatch(match);
  };

  const handleClosePreview = () => {
    setSelectedMatch(null);
  };

  // Sort matches by date (newest first)
  const sortedMatches = [...matches].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      {sortedMatches.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Resultat</TableHead>
                <TableHead>Mål</TableHead>
                <TableHead>Assist</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMatches.map(match => {
                const result = formatResult(match);
                
                return (
                  <TableRow 
                    key={match.id} 
                    className="cursor-pointer hover:bg-accent/10"
                    onClick={() => handleRowClick(match)}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatDate(match.date)}</span>
                        <span className="text-xs text-muted-foreground">{match.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>{match.name}</TableCell>
                    <TableCell>
                      {result ? (
                        <Badge className={getResultBadgeClass(match)}>
                          {result}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {match.player_stats?.goals?.[player.id] ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {match.player_stats.goals[player.id]}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {match.player_stats?.assists?.[player.id] ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {match.player_stats.assists[player.id]}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Spelaren har inte deltagit i några matcher ännu
        </div>
      )}
      
      <MatchPreview 
        match={selectedMatch}
        isOpen={!!selectedMatch}
        onClose={handleClosePreview}
        players={allPlayers}
      />
    </>
  );
}
