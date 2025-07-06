/**
 * Performance optimization utilities
 */

// Debounce function to limit how often a function can be called
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function to limit function execution rate
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoization helper for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
}

// Virtual scrolling helper
export function calculateVisibleRange(
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  buffer: number = 5
): { start: number; end: number } {
  const start = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = start + visibleCount + buffer;
  
  return { start: Math.max(0, start - buffer), end };
}

// Performance measurement helper
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} took ${(end - start).toFixed(2)}ms`);
  return result;
}

// Async performance measurement helper
export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`${name} took ${(end - start).toFixed(2)}ms`);
  return result;
}

// Batch processing helper for large datasets
export function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => R,
  batchSize: number = 100,
  delay: number = 0
): Promise<R[]> {
  return new Promise((resolve) => {
    const results: R[] = [];
    let index = 0;
    
    function processBatch() {
      const batch = items.slice(index, index + batchSize);
      
      if (batch.length === 0) {
        resolve(results);
        return;
      }
      
      batch.forEach(item => {
        results.push(processor(item));
      });
      
      index += batchSize;
      
      if (delay > 0) {
        setTimeout(processBatch, delay);
      } else {
        processBatch();
      }
    }
    
    processBatch();
  });
}

// Image lazy loading helper
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  placeholder?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (placeholder) {
      img.src = placeholder;
    }
    
    const imageLoader = new Image();
    imageLoader.onload = () => {
      img.src = src;
      resolve();
    };
    imageLoader.onerror = reject;
    imageLoader.src = src;
  });
}

// Memory management helper
export function cleanupMemory(): void {
  if ('gc' in window) {
    // @ts-ignore - gc is available in some browsers
    window.gc();
  }
}

// Request animation frame wrapper for smooth animations
export function smoothAnimation(
  callback: (progress: number) => void,
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    
    function animate(currentTime: number) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      callback(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }
    
    requestAnimationFrame(animate);
  });
} 