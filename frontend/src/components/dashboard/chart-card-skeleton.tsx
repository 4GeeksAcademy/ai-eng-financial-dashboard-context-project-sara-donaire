import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ChartCardSkeletonProps {
  statusLabel: string
}

// Same footprint as a rendered chart card (header + 280px plot area), so swapping
// the skeleton for the real chart does not shift the layout.
export function ChartCardSkeleton({ statusLabel }: ChartCardSkeletonProps) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="h-3 w-64 mt-1" />
      </CardHeader>
      <CardContent>
        <span role="status" className="sr-only">{statusLabel}</span>
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}
