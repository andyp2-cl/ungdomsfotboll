
import { ActivitySearch } from "@/components/activity-list/ActivitySearch";

interface ActivityTabSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isHistorical: boolean;
}

export function ActivityTabSearch({
  searchQuery,
  setSearchQuery,
  isHistorical
}: ActivityTabSearchProps) {
  return (
    <ActivitySearch
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      placeholder={`Sök ${isHistorical ? 'historiska ' : ''}matcher...`}
    />
  );
}
