import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { KeyboardEvent, useState, useRef, useEffect } from "react";

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
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Focus input on component mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSearch) {
        onSearch(searchQuery);
      }
      // Keep focus on the input field after search
      inputRef.current?.focus();
    }
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
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
