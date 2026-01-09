'use client';

/**
 * Lazy Loading Components
 * 
 * Provides lazy loading wrappers for better performance:
 * - Intersection Observer-based loading
 * - Skeleton placeholders
 * - Error boundaries
 */

import React, { 
  Suspense, 
  lazy, 
  useState, 
  useEffect, 
  useRef,
  ComponentType,
  ReactNode
} from 'react';

interface LazyLoadProps {
  children: ReactNode;
  /** Skeleton component to show while loading */
  skeleton?: ReactNode;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Threshold for intersection observer */
  threshold?: number;
  /** Minimum height to prevent layout shift */
  minHeight?: number | string;
  /** Disable lazy loading */
  disabled?: boolean;
}

/**
 * Lazy load content when it enters the viewport
 */
export function LazyLoad({
  children,
  skeleton,
  rootMargin = '200px',
  threshold = 0.1,
  minHeight,
  disabled = false,
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(disabled);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;

    const element = ref.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold, disabled]);

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div ref={ref} style={{ minHeight }}>
      {isVisible ? children : skeleton}
    </div>
  );
}

/**
 * Create a lazy-loaded component with error boundary
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createLazyComponent<P = any>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
): React.FC<P> {
  const LazyComponent = lazy(importFn);

  const LazyWrapper: React.FC<P> = (props) => {
    return (
      <Suspense fallback={fallback || <div className="animate-pulse bg-gray-100 h-32 rounded" />}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };

  return LazyWrapper;
}

/**
 * Lazy load images with blur placeholder
 */
interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const element = ref.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: `${width}/${height}` }}
    >
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}

      {/* Image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
}

/**
 * Defer rendering until after hydration
 */
interface DeferProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function Defer({ children, fallback = null }: DeferProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return <>{isClient ? children : fallback}</>;
}

/**
 * Load content on idle or interaction
 */
interface IdleLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** Load on user interaction instead of idle */
  loadOnInteraction?: boolean;
}

export function IdleLoad({ 
  children, 
  fallback, 
  loadOnInteraction = false 
}: IdleLoadProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loadOnInteraction) {
      const handleInteraction = () => {
        setShouldLoad(true);
      };

      const element = containerRef.current;
      if (element) {
        element.addEventListener('mouseenter', handleInteraction, { once: true });
        element.addEventListener('touchstart', handleInteraction, { once: true });
      }

      return () => {
        if (element) {
          element.removeEventListener('mouseenter', handleInteraction);
          element.removeEventListener('touchstart', handleInteraction);
        }
      };
    }

    // Load on idle
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => setShouldLoad(true), { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }

    // Fallback for Safari
    const timeout = setTimeout(() => setShouldLoad(true), 200);
    return () => clearTimeout(timeout);
  }, [loadOnInteraction]);

  return (
    <div ref={containerRef}>
      {shouldLoad ? children : fallback}
    </div>
  );
}

/**
 * Progressive loading wrapper
 * Shows skeleton -> low quality -> full quality
 */
interface ProgressiveProps {
  skeleton: ReactNode;
  lowQuality?: ReactNode;
  children: ReactNode;
  /** Delay before showing full quality (ms) */
  delay?: number;
}

export function Progressive({
  skeleton,
  lowQuality,
  children,
  delay = 100,
}: ProgressiveProps) {
  const [stage, setStage] = useState<'skeleton' | 'low' | 'full'>('skeleton');

  useEffect(() => {
    // Show low quality immediately if available
    if (lowQuality) {
      setStage('low');
    }

    // Show full quality after delay
    const timeout = setTimeout(() => {
      setStage('full');
    }, delay);

    return () => clearTimeout(timeout);
  }, [lowQuality, delay]);

  switch (stage) {
    case 'skeleton':
      return <>{skeleton}</>;
    case 'low':
      return <>{lowQuality}</>;
    case 'full':
      return <>{children}</>;
  }
}

/**
 * Virtualized list for long lists
 * Simple implementation - for complex cases use react-window
 */
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  className = '',
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      setContainerHeight(container.clientHeight);
    };

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    handleResize();
    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: '100%' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
