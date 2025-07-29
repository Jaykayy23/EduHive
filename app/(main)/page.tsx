import PostEditor from "@/components/posts/editor/PostEditor"
import TrendsSidebar from "@/components/TrendsSidebar"
import HomePageContent from "./HomePageContent"

export default function Home() {
  return (
    <main className="w-full min-w-0 flex gap-5">
      <div className="w-full min-w-0 space-y-5">
        <PostEditor />
        <HomePageContent />
      </div>
      <TrendsSidebar />
    </main>
  )
}
