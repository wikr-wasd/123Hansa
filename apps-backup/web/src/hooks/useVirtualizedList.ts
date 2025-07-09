import { useState, useMemo } from 'react';

interface VirtualizedListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  items: any[];
}

interface VirtualizedListResult {
  visibleItems: any[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
}

/**
 * Custom hook for virtualizing large lists
 * Critical for handling 1000+ listings/users efficiently
 */
export const useVirtualizedList = ({
  itemHeight,
  containerHeight,
  overscan = 5,
  items
}: VirtualizedListOptions): VirtualizedListResult => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex,
    totalHeight,
    offsetY
  };
};

/**
 * Component wrapper for virtualized admin tables
 */
export const VirtualizedTable = ({ 
  items, 
  renderItem, 
  itemHeight = 80,
  containerHeight = 600 
}: {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const { visibleItems, totalHeight, offsetY, startIndex } = useVirtualizedList({
    items,
    itemHeight,
    containerHeight
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return {
    visibleItems,
    startIndex,
    totalHeight,
    offsetY,
    handleScroll,
    containerProps: {
      className: "overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
      style: { height: containerHeight },
      onScroll: handleScroll
    }
  };
};