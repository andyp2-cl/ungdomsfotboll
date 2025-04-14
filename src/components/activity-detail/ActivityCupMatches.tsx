
import { Activity } from "@/types/player";
import { formatDate } from "@/utils/formatDate";
import { ChevronRight } from "lucide-react";

interface ActivityCupMatchesProps {
  cupMatches: Activity[];
  onActivitySelect?: (activity: Activity) => void;
}

export function ActivityCupMatches({ cupMatches, onActivitySelect }: ActivityCupMatchesProps) {
  if (!cupMatches || cupMatches.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-3">Cupmatcher ({cupMatches.length})</h3>
      <div className="space-y-2">
        {cupMatches.map((match) => (
          <div
            key={match.id}
            onClick={() => onActivitySelect && onActivitySelect(match)}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
          >
            <div>
              <div className="font-medium">{match.name}</div>
              <div className="text-sm text-gray-500 flex flex-wrap gap-2">
                <span>{formatDate(match.date)}</span>
                {match.time && <span>• {match.time}</span>}
                {match.location?.name && <span>• {match.location.name}</span>}
              </div>
            </div>
            <div className="flex items-center">
              {match.homeScore !== undefined && match.awayScore !== undefined && (
                <div className="mr-2 font-medium">{match.homeScore}-{match.awayScore}</div>
              )}
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
