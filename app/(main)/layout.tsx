import { redirect } from "next/navigation";
import { validateRequest } from "../auth";
import SessionProvider from "./SessionProvider";
import Navbar from "./Navbar";
import MenuBarWrapper from "./MenuBarWrapper";
import { Suspense } from "react";
import { BookLoader } from "@/components/ui/book-loader";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) redirect("/login");

  return (
    <SessionProvider value={session}>
      <div className="bg-gradient-surface flex min-h-screen flex-col">
        <Navbar session={session} />
        <div className="mx-auto flex w-full max-w-7xl grow flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:flex-row lg:gap-8 lg:p-8">
          {/* Desktop Sidebar — wrapped in Suspense so page content renders immediately */}
          <Suspense
            fallback={
              <div className="glass-strong rounded-premium-lg shadow-dramatic border-border/30 sticky top-[5rem] hidden h-fit flex-none border px-4 py-6 sm:px-6 sm:py-8 lg:block xl:w-80">
                <div className="flex flex-col items-center justify-center py-8">
                  <BookLoader size="1.5rem" />
                </div>
              </div>
            }
          >
            <MenuBarWrapper className="glass-strong rounded-premium-lg shadow-dramatic border-border/30 animate-slideInLeft sticky top-[5rem] hidden h-fit flex-none space-y-2 border px-4 py-6 sm:space-y-3 sm:px-6 sm:py-8 lg:block xl:w-80" />
          </Suspense>

          {/* Main Content */}
          <main className="animate-fadeIn w-full min-w-0 space-y-4 sm:space-y-6 lg:space-y-8">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation — wrapped in Suspense */}
        <Suspense
          fallback={
            <div className="border-border/30 bg-card/95 backdrop-blur-premium shadow-dramatic glass sticky bottom-0 z-50 flex w-full justify-center gap-2 border-t p-3 sm:hidden">
              <BookLoader size="1.25rem" />
            </div>
          }
        >
          <MenuBarWrapper className="border-border/30 bg-card/95 backdrop-blur-premium shadow-dramatic glass sticky bottom-0 z-50 flex w-full justify-center gap-2 border-t p-3 sm:hidden" />
        </Suspense>
      </div>
    </SessionProvider>
  );
}
