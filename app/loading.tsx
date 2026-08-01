import { BookLoader } from "@/components/ui/book-loader";

export default function Loading() {
  return (
    <div className="bg-gradient-surface flex min-h-svh w-full items-center justify-center">
      <BookLoader label="Loading EduHive" size="4rem" />
    </div>
  );
}
