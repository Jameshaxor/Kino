export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-bg-elevated rounded-lg animate-shimmer bg-[length:200%_100%] bg-[linear-gradient(110deg,var(--color-bg-elevated)_8%,var(--color-bg-surface)_18%,var(--color-bg-elevated)_33%)] ${className}`}
    />
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 min-w-[150px] md:min-w-[185px]">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/3 rounded" />
    </div>
  );
}

export function CarouselSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-4 md:gap-5 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="animate-fade-in">
      <Skeleton className="w-full h-[60vh]" />
      <div className="max-w-6xl mx-auto px-6 -mt-32 relative z-10 flex gap-8">
        <Skeleton className="w-[300px] aspect-[2/3] rounded-lg hidden md:block" />
        <div className="flex flex-col gap-4 flex-1 pt-8">
          <Skeleton className="h-12 w-2/3 rounded" />
          <Skeleton className="h-6 w-1/3 rounded" />
          <Skeleton className="h-24 w-full rounded" />
        </div>
      </div>
    </div>
  );
}
