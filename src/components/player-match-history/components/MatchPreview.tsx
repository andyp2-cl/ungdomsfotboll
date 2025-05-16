
import React from 'react';
import { Activity, Player } from '@/types/player';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '../utils/date-formatter';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface MatchPreviewProps {
  match: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
}

export function MatchPreview({ match, isOpen, onClose, players }: MatchPreviewProps) {
  if (!match) return null;

  // Format match result
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

  // Find participating players
  const matchParticipants = match.participants 
    ? players.filter(player => match.participants.includes(player.id)) 
    : [];

  // Get goal scorers for this match
  const goalScorers = match.player_stats?.goals 
    ? Object.entries(match.player_stats.goals)
      .filter(([_, goals]) => goals > 0)
      .map(([playerId, goals]) => {
        const player = players.find(p => p.id === playerId);
        return { 
          player, 
          goals,
          name: player ? `${player.name || `${player.id}`}` : 'Unknown Player'
        };
      })
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6" onInteractOutside={onClose}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{match.name}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {/* Match info section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-lg mb-2">
                <span className="text-muted-foreground">Datum:</span> {formatDate(match.date)}
              </p>
              {match.time && (
                <p className="text-lg mb-2">
                  <span className="text-muted-foreground">Tid:</span> {match.time}
                </p>
              )}
              {match.location?.name && (
                <p className="text-lg">
                  <span className="text-muted-foreground">Plats:</span> {match.location.name}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end justify-start">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Resultat</p>
                {formatResult(match) ? (
                  <Badge className={`text-lg px-4 py-2 ${getResultBadgeClass(match)}`}>
                    {formatResult(match)}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
            </div>
          </div>

          {/* Goal scorers section */}
          {goalScorers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Målskyttar</h3>
              <div className="grid grid-cols-2 gap-4">
                {goalScorers.map(({ player, goals, name }) => (
                  <div key={player?.id || name} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {player?.image ? (
                        <AvatarImage src={player.image} alt={name} />
                      ) : (
                        <AvatarFallback>
                          <User size={24} />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <span className="font-medium">{name}</span>
                      <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                        {goals} {goals === 1 ? 'mål' : 'mål'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Participants section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Deltagare</h3>
            <div className="grid grid-cols-3 gap-3">
              {matchParticipants.map(player => (
                <div key={player.id} className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    {player.image ? (
                      <AvatarImage src={player.image} alt={player.name || player.id} />
                    ) : (
                      <AvatarFallback>
                        <User size={24} />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="truncate">
                    <span>{player.name || player.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
