import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
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
        <SearchField />
        <UserButton className="sm:ms-auto"/>
      </div>
    </header>
  );
}
