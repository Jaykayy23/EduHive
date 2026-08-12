import PostEditor from "@/components/posts/editor/PostEditor";
import TrendsSidebar from "@/components/TrendsSidebar";
import WhoToFollow from "@/components/people/WhoToFollow";
import { BookLoader } from "@/components/ui/book-loader";
import { Suspense } from "react";
import HomePageContent from "../HomePageContent";
import TrendingTopics from "@/components/TrendingTopics";

export default function Home() {
  return (
    <div className="grid w-full min-w-0 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-8">
      <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
        <PostEditor />
        <section className="xl:hidden" aria-label="Who to follow">
          <Suspense fallback={<BookLoader className="mx-auto" size="2rem" />}>
            <WhoToFollow variant="mobile" />
          </Suspense>
        </section>
        <section className="xl:hidden" aria-label="Trending topics">
          <Suspense fallback={<BookLoader className="mx-auto" size="2rem" />}>
            <TrendingTopics variant="mobile" />
          </Suspense>
        </section>
        <HomePageContent />
      </div>

      <aside className="hidden xl:block" aria-label="Suggestions and trends">
        <TrendsSidebar />
      </aside>
    </div>
  );
}
