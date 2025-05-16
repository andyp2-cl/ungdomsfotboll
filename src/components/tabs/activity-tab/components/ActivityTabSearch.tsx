
import { SearchInput } from "@/components/SearchInput";
import { Search } from "lucide-react";

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
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <SearchInput
        placeholder={`Sök ${isHistorical ? 'historiska' : 'kommande'} aktiviteter...`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
