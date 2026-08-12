import { BookLoader } from "@/components/ui/book-loader";
import { Suspense } from "react";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { formatNumber } from "@/lib/utils";
import WhoToFollow from "@/components/people/WhoToFollow";
import prisma from "@/lib/prisma";

export default function TrendsSidebar() {
  return (
    <div className="sticky top-20 hidden h-fit w-72 flex-none flex-col gap-5 md:flex lg:w-80">
      <Suspense fallback={<BookLoader className="mx-auto" size="2rem" />}>
        <WhoToFollow />
      </Suspense>
      <Suspense fallback={<BookLoader className="mx-auto" size="2rem" />}>
        <TrendingTopics />
      </Suspense>
    </div>
  );
}

const getTrendingTopics = unstable_cache(
  async () => {
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
            SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
            FROM posts
            GROUP BY (hashtag)
            ORDER BY count DESC, hashtag ASC
            LIMIT 5 
        `;

    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));
  },
  ["trending-topics"],
  {
    revalidate: 3 * 60 * 60,
  },
);

async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics();

  return (
    <div className="bg-card space-y-5 rounded-2xl p-5 shadow-sm">
      <div className="text-xl font-bold">Trending topics</div>
      {trendingTopics.map(({ hashtag, count }) => {
        const title = hashtag.split("#")[1];

        return (
          <Link key={title} href={`/hashtag/${title}`} className="block">
            <p
              className="line-clamp-1 font-semibold break-all hover:underline"
              title={hashtag}
            >
              {hashtag}
            </p>
            <p className="text-muted-foreground text-sm">
              {formatNumber(count)} {count === 1 ? "post" : "posts"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
