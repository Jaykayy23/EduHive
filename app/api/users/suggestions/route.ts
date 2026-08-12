import { validateRequest } from "@/app/auth";
import {
  DISCOVER_SUGGESTION_PAGE_SIZE,
  getUserSuggestions,
} from "@/lib/user-suggestions";

export async function GET(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cursor = new URL(request.url).searchParams.get("cursor") ?? undefined;
    const suggestions = await getUserSuggestions(user.id, {
      cursor,
      limit: DISCOVER_SUGGESTION_PAGE_SIZE,
    });

    return Response.json(suggestions);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
