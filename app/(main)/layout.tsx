
import { redirect } from "next/navigation";
import { validateRequest } from "../auth";
import SessionProvider from "./SessionProvider";
import Navbar from "./Navbar";
import MenuBarWrapper from "./MenuBarWrapper";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) redirect("/login");

  return (
    <SessionProvider value={session}>
      <div className="flex min-h-screen flex-col bg-gradient-surface">
        <Navbar session={session} />
        <div className="mx-auto flex w-full max-w-7xl grow flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:flex-row lg:gap-8 lg:p-8">
          {/* Desktop Sidebar — wrapped in Suspense so page content renders immediately */}
          <Suspense fallback={
            <div className="glass-strong sticky top-[5rem] hidden h-fit flex-none rounded-premium-lg px-4 py-6 shadow-dramatic border border-border/30 sm:px-6 sm:py-8 lg:block xl:w-80">
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            </div>
          }>
            <MenuBarWrapper className="glass-strong sticky top-[5rem] hidden h-fit flex-none space-y-2 rounded-premium-lg px-4 py-6 shadow-dramatic border border-border/30 sm:space-y-3 sm:px-6 sm:py-8 lg:block xl:w-80 animate-slideInLeft" />
          </Suspense>
          
          {/* Main Content */}
          <main className="w-full min-w-0 space-y-4 sm:space-y-6 lg:space-y-8 animate-fadeIn">
            {children}
          </main>
        </div>
        
        {/* Mobile Bottom Navigation — wrapped in Suspense */}
        <Suspense fallback={
          <div className="sticky bottom-0 z-50 flex w-full justify-center gap-2 border-t border-border/30 bg-card/95 backdrop-blur-premium p-3 shadow-dramatic glass sm:hidden">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        }>
          <MenuBarWrapper className="sticky bottom-0 z-50 flex w-full justify-center gap-2 border-t border-border/30 bg-card/95 backdrop-blur-premium p-3 shadow-dramatic glass sm:hidden"/>
        </Suspense>
      </div>
    </SessionProvider>
  );
}
