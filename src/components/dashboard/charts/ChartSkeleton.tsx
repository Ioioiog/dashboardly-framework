import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ChartSkeletonProps {
  title?: string;
  subtitle?: string;
}

export function ChartSkeleton({ title, subtitle }: ChartSkeletonProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <div className="space-y-3">
          {title && <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />}
          {subtitle && <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />}
        </div>
      </CardHeader>
      <CardContent className="h-[300px] animate-pulse bg-muted/10" />
    </Card>
  );
}