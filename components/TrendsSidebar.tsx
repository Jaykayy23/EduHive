import { BookLoader } from "@/components/ui/book-loader";
import { Suspense } from "react";
import WhoToFollow from "@/components/people/WhoToFollow";
import TrendingTopics from "@/components/TrendingTopics";

export default function TrendsSidebar() {
  return (
    <div className="sticky top-20 hidden max-h-[calc(100svh-6rem)] w-72 flex-none flex-col gap-5 overflow-y-auto overscroll-contain pb-1 md:flex lg:w-80">
      <Suspense fallback={<BookLoader className="mx-auto" size="2rem" />}>
        <WhoToFollow />
      </Suspense>
      <Suspense fallback={<BookLoader className="mx-auto" size="2rem" />}>
        <TrendingTopics />
      </Suspense>
    </div>
  );
}
