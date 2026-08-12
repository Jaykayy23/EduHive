import Link from "next/link";

import { validateRequest } from "@/app/auth";
import PeopleSuggestionsList from "@/components/people/PeopleSuggestionsList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getUserSuggestions,
  HOME_SUGGESTION_LIMIT,
} from "@/lib/user-suggestions";

interface WhoToFollowProps {
  variant?: "desktop" | "mobile";
}

export default async function WhoToFollow({
  variant = "desktop",
}: WhoToFollowProps) {
  const { user } = await validateRequest();
  if (!user) return null;

  const { users } = await getUserSuggestions(user.id, {
    limit: HOME_SUGGESTION_LIMIT,
  });
  if (!users.length) return null;

  return (
    <Card className={variant === "mobile" ? "gap-4 py-5" : "gap-5"}>
      <CardHeader className={variant === "mobile" ? "px-4" : undefined}>
        <CardTitle className="text-xl">Who to follow</CardTitle>
        {variant === "mobile" && (
          <CardDescription>Discover more people in the community</CardDescription>
        )}
        <CardAction>
          <Button asChild variant="ghost" size="sm">
            <Link href="/people">See all</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className={variant === "mobile" ? "px-4" : undefined}>
        <PeopleSuggestionsList users={users} variant={variant} />
      </CardContent>
    </Card>
  );
}
