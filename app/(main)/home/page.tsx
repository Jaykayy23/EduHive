import PostEditor from "@/components/posts/editor/PostEditor";
import TrendsSidebar from "@/components/TrendsSidebar";
import HomePageContent from "../HomePageContent";

export default function Home() {
  return (
    <div className="grid w-full min-w-0 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-8">
      <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
        <PostEditor />
        <HomePageContent />
      </div>

      <aside className="hidden xl:block" aria-label="Suggestions and trends">
        <TrendsSidebar />
      </aside>
    </div>
  );
}
