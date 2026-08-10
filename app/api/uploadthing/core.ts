import { validateRequest } from "@/app/auth";
import { createUploadthing, FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { claimRateLimit } from "@/lib/rate-limit";

const f = createUploadthing();

export const fileRouter = {
  avatar: f({
    image: { maxFileSize: "512KB" },
  })
    .middleware(async () => {
      const { user } = await validateRequest();

      if (!user) throw new UploadThingError("Unauthorized");

      const rateLimit = await claimRateLimit({
        namespace: "upload:avatar",
        identifier: user.id,
        limit: 10,
        windowMs: 60 * 60 * 1_000,
      });
      if (!rateLimit.allowed) {
        throw new UploadThingError("Avatar upload limit reached. Try again later.");
      }

      return { userId: user.id, oldAvatarUrl: user.avatarUrl };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const newAvatarUrl = file.ufsUrl;

      await prisma.user.update({
        where: { id: metadata.userId },
        data: { avatarUrl: newAvatarUrl },
      });

      try {
        await streamServerClient.partialUpdateUser({
          id: metadata.userId,
          set: {
            image: newAvatarUrl
          }
        });
      } catch (error) {
        console.error("Stream avatar synchronization failed", {
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }

      const oldKey = metadata.oldAvatarUrl?.split("/f/")[1];
      if (oldKey) {
        try {
          await new UTApi().deleteFiles(oldKey);
        } catch (error) {
          console.error("Old avatar cleanup failed", {
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return { avatarUrl: newAvatarUrl };
    }),
    attachment: f({
      image: { maxFileSize: "4MB", maxFileCount: 5 },
      video: { maxFileSize: "64MB", maxFileCount: 5 },
    })
    .middleware(async () => {
      const { user } = await validateRequest();

      if (!user) throw new UploadThingError("Unauthorized");

      const rateLimit = await claimRateLimit({
        namespace: "upload:attachment",
        identifier: user.id,
        limit: 30,
        windowMs: 60 * 60 * 1_000,
      });
      if (!rateLimit.allowed) {
        throw new UploadThingError("Attachment upload limit reached. Try again later.");
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const media = await prisma.media.create({
        data: {
          ownerId: metadata.userId,
          url: file.ufsUrl,
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        }
      });
      return { mediaId: media.id };
    })
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
