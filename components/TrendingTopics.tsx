import Link from "next/link";
import { unstable_cache } from "next/cache";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import prisma from "@/lib/prisma";
import { cn, formatNumber } from "@/lib/utils";

interface TrendingTopicsProps {
  variant?: "desktop" | "mobile";
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
  { revalidate: 3 * 60 * 60 },
);

export default async function TrendingTopics({
  variant = "desktop",
}: TrendingTopicsProps) {
  const trendingTopics = await getTrendingTopics();
  if (!trendingTopics.length) return null;

  const topics = trendingTopics.map(({ hashtag, count }) => {
    const title = hashtag.slice(1);

    return (
      <Link
        key={hashtag}
        href={`/hashtag/${title}`}
        className={cn(
          "transition-colors hover:bg-accent",
          variant === "mobile" &&
            "w-40 shrink-0 snap-start rounded-xl border bg-background p-4",
          variant === "desktop" &&
            "block min-w-0 rounded-lg px-1 py-1",
        )}
      >
        <p className="truncate font-semibold" title={hashtag}>
          {hashtag}
        </p>
        <p className="text-muted-foreground text-sm">
          {formatNumber(count)} {count === 1 ? "post" : "posts"}
        </p>
      </Link>
    );
  });

  return (
    <Card className={variant === "mobile" ? "gap-4 py-5" : "gap-5"}>
      <CardHeader className={variant === "mobile" ? "px-4" : undefined}>
        <CardTitle className="text-xl">Trending topics</CardTitle>
        {variant === "mobile" && (
          <CardDescription>See what the community is discussing</CardDescription>
        )}
      </CardHeader>
      <CardContent className={variant === "mobile" ? "px-4" : undefined}>
        {variant === "mobile" ? (
          <ScrollArea className="w-full pb-3">
            <div className="flex snap-x gap-3">{topics}</div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <div className="flex flex-col gap-3">{topics}</div>
        )}
      </CardContent>
    </Card>
  );
}
