
import { Player } from "@/types/player";
import { BadgeCheck } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface PlayerCardProps {
  player: Player;
  className?: string;
  onClick?: () => void;
  onSelect?: () => void; // Add this prop to match expected usage
  onEdit?: () => void; // Add this prop to match expected usage
  action?: React.ReactNode; // Add this prop to match expected usage
  selected?: boolean;
  showGrade?: boolean;
  actions?: React.ReactNode;
  compact?: boolean; // Add this prop to match expected usage
  showStats?: boolean; // Add this prop to match expected usage
}

export function PlayerCard({
  player,
  className,
  onClick,
  onSelect, // Support this prop
  onEdit, // Support this prop
  action, // Support this prop
  selected = false,
  showGrade = true,
  actions,
  compact = false, // Support this prop
  showStats = false // Support this prop
}: PlayerCardProps) {
  const isCoach = player.positions?.includes('TRÄNARE');
  const shouldShowGrade = showGrade && !isCoach;
  
  // Use onClick or onSelect if provided
  const handleClick = onClick || onSelect;

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all",
        selected && "ring-2 ring-primary",
        handleClick && "cursor-pointer hover:shadow-md",
        compact && "!p-0",
        className
      )} 
      onClick={handleClick}
    >
      <CardHeader className="p-0 relative overflow-hidden h-40 bg-muted">
        {player.image ? (
          <img 
            src={player.image} 
            alt={player.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <span className="text-4xl font-bold text-muted-foreground">{player.name?.charAt(0) || "?"}</span>
          </div>
        )}
        
        {isCoach && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground py-0.5 px-2 rounded text-xs font-medium">
            Tränare
          </div>
        )}
        
        {shouldShowGrade && player.grade && (
          <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground py-0.5 px-2 rounded text-xs font-medium">
            Nivå {player.grade}
          </div>
        )}
        
        {actions && (
          <div className="absolute top-2 right-2">
            {actions}
          </div>
        )}
        
        {action && (
          <div className="absolute top-2 right-2">
            {action}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-3 pb-2">
        <div className="font-medium truncate">{player.name}</div>
        
        <div className="text-sm text-muted-foreground flex items-center space-x-2">
          {player.positions?.map((position, idx) => (
            position !== 'TRÄNARE' && (
              <span key={idx} className="inline-block">
                {position}
                {idx < (player.positions?.length || 0) - 1 && position !== 'TRÄNARE' ? ', ' : ''}
              </span>
            )
          ))}
        </div>
        
        {player.jerseyNumber && (
          <div className="text-xs text-muted-foreground mt-1">
            #{player.jerseyNumber}
          </div>
        )}
      </CardContent>
      
      {player.development && showStats && (
        <CardFooter className="pt-0 pb-3 px-4 flex items-center">
          <div className="text-xs text-muted-foreground flex items-center">
            <BadgeCheck className="h-3 w-3 mr-1 text-primary" />
            <span>Utveckling: {Math.round((
              (player.development.technical || 0) +
              (player.development.gameUnderstanding || 0) +
              (player.development.passing || 0) +
              (player.development.offensive || 0) +
              (player.development.defensive || 0) +
              (player.development.mentality || 0)
            ) / 6)}/10</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
