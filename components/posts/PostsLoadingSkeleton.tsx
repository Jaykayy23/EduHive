import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostsLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-label="Loading posts">
      <PostLoadingSkeleton />
      <PostLoadingSkeleton />
      <PostLoadingSkeleton />
    </div>
  );
}

function PostLoadingSkeleton() {
  return (
    <Card className="rounded-premium border-border/70 shadow-soft gap-0 overflow-hidden py-0">
      <CardHeader className="border-border/60 flex flex-row items-center gap-3 border-b px-4 py-4 sm:px-5 [.border-b]:pb-4">
        <Skeleton className="size-11 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
        <Skeleton className="size-8 rounded-lg" />
      </CardHeader>

      <CardContent className="flex flex-col gap-3 px-4 py-5 sm:px-5">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-[82%] rounded-md" />
        <Skeleton className="mt-1 aspect-[16/8] w-full rounded-xl" />
      </CardContent>

      <CardFooter className="border-border/60 bg-muted/25 justify-between gap-4 border-t px-3 py-3 [.border-t]:pt-3">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </CardFooter>
    </Card>
  );
}
