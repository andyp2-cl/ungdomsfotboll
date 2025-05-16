
import React from "react";
import { SearchInput } from "@/components/SearchInput";

interface ActivityTabSearchProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isHistorical?: boolean;
  placeholder?: string;
}

export function ActivityTabSearch({
  searchQuery,
  setSearchQuery,
  isHistorical = false,
  placeholder
}: ActivityTabSearchProps) {
  const defaultPlaceholder = isHistorical
    ? "Sök i historiska aktiviteter..."
    : "Sök i kommande aktiviteter...";

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <SearchInput
      placeholder={placeholder || defaultPlaceholder}
      value={searchQuery}
      onChange={handleSearchChange}
    />
  );
}
