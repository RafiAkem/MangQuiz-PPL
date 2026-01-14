import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-navy-800/50 shimmer-effect",
        className
      )}
      {...props}
    />
  )
}

// Question skeleton for loading states
function QuestionSkeleton() {
  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 dither-noise z-10 pointer-events-none mix-blend-overlay opacity-20" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
      
      <div className="relative z-20 container mx-auto px-4 py-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Question card skeleton */}
          <div className="bg-navy-900/50 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl mb-8 p-8">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>

            <Skeleton className="h-12 w-full mb-6" />
            <Skeleton className="h-8 w-3/4 mb-6" />

            {/* Progress bar skeleton */}
            <Skeleton className="h-2 w-full mb-8 rounded-full" />

            {/* Answer options skeleton */}
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-navy-800/50 border border-white/20 rounded-lg p-6">
                  <Skeleton className="h-6 w-full mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



// Player card skeleton
function PlayerCardSkeleton() {
  return (
    <div className="bg-navy-900/50 border border-white/10 rounded-lg p-6">
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  )
}

export { Skeleton, QuestionSkeleton, PlayerCardSkeleton }