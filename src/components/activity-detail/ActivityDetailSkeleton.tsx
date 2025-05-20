
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ActivityDetailSkeleton() {
  return (
    <Card className="w-full flex flex-col lg:max-w-3xl mx-auto">
      <CardHeader className="px-3 py-3 border-b flex-shrink-0">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[180px]" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 py-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-[120px]" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-5 w-[150px]" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-5 w-[170px]" />
          <Skeleton className="h-[200px] w-full rounded-md" />
        </div>
      </CardContent>
      
      <CardFooter className="px-3 py-3 border-t bg-background">
        <Skeleton className="h-11 w-full" />
      </CardFooter>
    </Card>
  );
}
