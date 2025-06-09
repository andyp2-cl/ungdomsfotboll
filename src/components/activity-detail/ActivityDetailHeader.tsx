
import React from "react";
import { Activity } from "@/types/player";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, ChevronLeft, Edit, MapPin, MoreVertical, Trash } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ShareMatchCard } from "@/components/share/ShareMatchCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface ActivityDetailHeaderProps {
  activity: Activity;
  isHistorical?: boolean;
  onClose: () => void;
  onEdit?: (activity: Activity) => void;
  onDeleteOpen: () => void;
}

export function ActivityDetailHeader({ activity, isHistorical, onClose, onEdit, onDeleteOpen }: ActivityDetailHeaderProps) {
  const isMobile = useIsMobile();

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE d MMMM yyyy");
    } catch (e) {
      return dateString;
    }
  };

  // Get activity type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "match":
        return "Match";
      case "training":
        return "Träning";
      case "cup":
        return "Cup";
      default:
        return "Övrigt";
    }
  };

  // Get activity type badge color
  const getTypeColor = (type: string) => {
    switch (type) {
      case "match":
        return "bg-blue-100 text-blue-800";
      case "training":
        return "bg-green-100 text-green-800";
      case "cup":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const targetElementId = `activity-detail-${activity.id}`;

  return (
    <CardHeader className={isMobile ? "pb-2 space-y-2" : "pb-2"}>
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onClose} className={isMobile ? "p-0 -ml-2" : ""}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Tillbaka</span>
        </Button>

        <div className="flex items-center gap-1">
          {/* Share button for matches */}
          {activity.type === 'match' && (
            <ShareMatchCard 
              targetElementId={targetElementId}
              size="sm"
              variant="outline"
            />
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Åtgärder</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(activity)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Redigera
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDeleteOpen} className="text-destructive">
                <Trash className="h-4 w-4 mr-2" />
                Ta bort
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardTitle className={isMobile ? "text-xl" : "text-2xl"}>{activity.name}</CardTitle>

      <div className="flex items-center flex-wrap gap-2">
        <Badge className={getTypeColor(activity.type)}>{getTypeLabel(activity.type)}</Badge>

        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          <span>
            {formatDate(activity.date)}
            {activity.time && ` • ${activity.time}`}
          </span>
        </div>

        {activity.location?.name && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{activity.location.name}</span>
          </div>
        )}
      </div>
    </CardHeader>
  );
}
