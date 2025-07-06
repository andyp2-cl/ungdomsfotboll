import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { calculateVisibleRange } from '@/utils/performance';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const { start, end } = useMemo(() => 
    calculateVisibleRange(height, itemHeight, scrollTop, overscan),
    [height, itemHeight, scrollTop, overscan]
  );

  // Get visible items
  const visibleItems = useMemo(() => 
    items.slice(start, Math.min(end, items.length)),
    [items, start, end]
  );

  // Calculate total height for scroll container
  const totalHeight = useMemo(() => 
    items.length * itemHeight,
    [items.length, itemHeight]
  );

  // Calculate offset for visible items
  const offsetY = useMemo(() => 
    start * itemHeight,
    [start, itemHeight]
  );

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Scroll to specific item
  const scrollToItem = useCallback((index: number) => {
    if (containerRef.current) {
      const targetScrollTop = index * itemHeight;
      containerRef.current.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  }, [itemHeight]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  // Expose scroll methods
  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as any).scrollToItem = scrollToItem;
      (containerRef.current as any).scrollToTop = scrollToTop;
    }
  }, [scrollToItem, scrollToTop]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={start + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for virtualized list state
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  const overscan = 5;

  const { start, end } = useMemo(() => 
    calculateVisibleRange(containerHeight, itemHeight, scrollTop, overscan),
    [containerHeight, itemHeight, scrollTop, overscan]
  );

  const visibleItems = useMemo(() => 
    items.slice(start, Math.min(end, items.length)),
    [items, start, end]
  );

  const totalHeight = useMemo(() => 
    items.length * itemHeight,
    [items.length, itemHeight]
  );

  const offsetY = useMemo(() => 
    start * itemHeight,
    [start, itemHeight]
  );

  return {
    scrollTop,
    setScrollTop,
    visibleItems,
    totalHeight,
    offsetY,
    start,
    end
  };
} 