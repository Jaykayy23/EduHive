import PostEditor from "@/components/posts/editor/PostEditor"
import TrendsSidebar from "@/components/TrendsSidebar"
import HomePageContent from "./HomePageContent"

export default function Home() {
  return (
    <div className="w-full min-w-0 flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
      <div className="w-full min-w-0 space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="animate-slideInLeft">
          <PostEditor />
        </div>
        <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <HomePageContent />
        </div>
      </div>
      <div className="hidden lg:block w-80 flex-shrink-0">
        <div className="animate-slideInRight" style={{ animationDelay: '0.3s' }}>
          <TrendsSidebar />
        </div>
      </div>
    </div>
  )
}
