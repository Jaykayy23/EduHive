
import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Image from "next/image";
import Link from "next/link";
import { validateRequest } from "../auth";
import { Button } from "@/components/ui/button";

export default async function Navbar() {
  const { user } = await validateRequest();

  return (
    <header className="bg-card sticky top-0 z-10 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-5 px-5 py-3">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <Image
              src="/images/mylogo.png"
              alt="EduHive Logo"
              width={50} // smaller width to match text height
              height={50} // smaller height to match text height
              className="rounded-full"
            />
          </Link>
          <Link href="/" className="text-primary text-2xl font-bold">
            EduHive
          </Link>
        </div>
        {user && <SearchField />}
        {user ? (
          <UserButton className="sm:ms-auto" />
        ) : (
          <div className="sm:ms-auto flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
