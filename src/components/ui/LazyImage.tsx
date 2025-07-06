import React, { useState, useRef, useEffect } from 'react';
import { UserCircle } from 'lucide-react';
import { createIntersectionObserver } from '@/utils/performance';

interface LazyImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage = React.memo<LazyImageProps>(({
  src,
  alt,
  className = '',
  fallback = <UserCircle className="h-full w-full text-muted-foreground" />,
  placeholder,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = createIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Show fallback if no src or error occurred
  if (!src || hasError) {
    return (
      <div className={className}>
        {fallback}
      </div>
    );
  }

  return (
    <div className={className} ref={imgRef}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          loading="lazy"
          crossOrigin="anonymous"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      {!isLoaded && isInView && placeholder && (
        <img
          src={placeholder}
          alt={`${alt} placeholder`}
          className={`absolute inset-0 transition-opacity duration-300 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}
      {!isInView && fallback && (
        <div className="absolute inset-0">
          {fallback}
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage'; 