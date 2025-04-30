
import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Pencil, Plus, Trash } from 'lucide-react';

// Define the Player interface if it's not already defined elsewhere
interface Player {
  id: string;
  name: string;
  image?: string;
  grade?: string;
  position?: string;
  trainer?: boolean;
}

interface PlayerCardProps {
  player: Player;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  isSelected?: boolean;
}

export function PlayerCard({ player, onEdit, onDelete, onClick, isSelected }: PlayerCardProps) {
  const handleClick = () => {
    if (onClick) onClick();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };
  
  const backgroundStyle = player.image 
    ? { backgroundImage: `url(${player.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;
  
  return (
    <Card 
      className={`relative cursor-pointer overflow-hidden transition-all ${
        isSelected ? 'border-primary ring-2 ring-primary' : ''
      }`} 
      onClick={handleClick}
    >
      <div 
        className="h-36 bg-gray-200 flex items-center justify-center"
        style={backgroundStyle}
      >
        {!player.image && <Plus className="h-8 w-8 text-gray-400" />}
      </div>
      
      <div className="p-3">
        <h3 className="font-medium truncate">{player.name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {player.grade && <span>{player.grade}</span>}
          {player.position && (
            <>
              {player.grade && <span>•</span>}
              <span>{player.position}</span>
            </>
          )}
          {player.trainer && <span className="ml-1 text-blue-500">(Tränare)</span>}
        </div>
      </div>
      
      {(onEdit || onDelete) && (
        <div className="absolute top-2 right-2 flex gap-2">
          {onEdit && (
            <Button size="icon" variant="ghost" onClick={handleEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button size="icon" variant="ghost" onClick={handleDelete}>
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
