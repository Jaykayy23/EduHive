import { BookLoader } from "@/components/ui/book-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100svh-10rem)] w-full items-center justify-center py-12">
      <BookLoader label="Loading page" size="3.5rem" />
    </div>
  );
}
