import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DocumentListSkeletonProps {
  viewMode: "grid" | "list";
}

export function DocumentListSkeleton({ viewMode }: DocumentListSkeletonProps) {
  return (
    <div className={`flex ${
      viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 gap-4' 
        : 'flex-col space-y-4'
    } max-w-5xl mx-auto`}>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Skeleton className="h-4 w-1/4 mb-1" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div>
              <Skeleton className="h-4 w-1/4 mb-1" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-9" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}