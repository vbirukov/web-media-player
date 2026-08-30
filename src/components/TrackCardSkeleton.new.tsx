import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Props = {
  layout?: "tiles" | "rows"
}

export function TrackCardSkeleton({ layout = "tiles" }: Props) {
  const isRow = layout === "rows"

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4",
        isRow ? "flex items-center gap-4" : "flex flex-col gap-3"
      )}
    >
      {isRow ? (
        /* Row layout skeleton */
        <div className="flex items-center gap-4 w-full">
          {/* Cover placeholder */}
          <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
          
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </div>
      ) : (
        /* Tile layout skeleton */
        <div className="flex flex-col gap-3">
          {/* Badges */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          
          {/* Title */}
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
          
          {/* Actions */}
          <div className="flex items-center gap-2 mt-auto pt-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-9 flex-1 rounded-md" />
          </div>
        </div>
      )}
    </div>
  )
}

export function TrackCardSkeletonGrid({ count = 6, layout = "tiles" }: { count?: number; layout?: "tiles" | "rows" }) {
  return (
    <div className={cn(
      "grid gap-4",
      layout === "rows" 
        ? "grid-cols-1" 
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <TrackCardSkeleton key={i} layout={layout} />
      ))}
    </div>
  )
}
