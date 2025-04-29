
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { KeyboardEvent, useState } from "react";

interface ActivitySearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function ActivitySearch({ 
  searchQuery, 
  setSearchQuery, 
  placeholder = "Sök matcher...",
  onSearch
}: ActivitySearchProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchQuery);
      e.preventDefault();
    }
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pl-9"
      />
    </div>
  );
}
