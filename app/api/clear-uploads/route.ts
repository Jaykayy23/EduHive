import prisma from "@/lib/prisma";
import { UTApi } from "uploadthing/server";

export async function GET(req: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      console.error("Upload cleanup is disabled because CRON_SECRET is not configured");
      return Response.json({ error: "Service unavailable" }, { status: 503 });
    }

    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return Response.json(
        { message: "Invalid authorization header" },
        { status: 401 },
      );
    }

    const unusedMedia = await prisma.media.findMany({
      where: {
        postId: null,
        ...(process.env.NODE_ENV === "production"
          ? {
              createdAt: {
                lte: new Date(Date.now() - 1000 * 60 * 60 * 24),
              },
            }
          : {}),
      },
      select: {
        id: true,
        url: true,
      },
    });

    const fileKeys = unusedMedia.map((media) => media.url.split("/f/")[1]);
    if (fileKeys.some((key) => !key)) {
      console.error("Upload cleanup found media with an invalid UploadThing URL");
      return Response.json({ error: "Invalid media data" }, { status: 500 });
    }

    if (fileKeys.length > 0) {
      const deletion = await new UTApi().deleteFiles(fileKeys);
      if (!deletion.success) {
        console.error("UploadThing cleanup failed", deletion);
        return Response.json({ error: "Storage cleanup failed" }, { status: 502 });
      }
    }

    const deleted = await prisma.media.deleteMany({
      where: {
        id: {
          in: unusedMedia.map((m) => m.id),
        },
      },
    });

    return Response.json({ deletedCount: deleted.count });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
