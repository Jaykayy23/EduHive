"use server"

import { validateRequest } from "@/app/auth"
import prisma from "@/lib/prisma"
import { ReportReason, ReportStatus } from "@/lib/types"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { isAdminUser } from "@/lib/admin"
import { claimRateLimit } from "@/lib/rate-limit"

const reportSchema = z
  .object({
    reportedPostId: z.string().trim().min(1).max(128).optional(),
    reportedCommentId: z.string().trim().min(1).max(128).optional(),
    reason: z.nativeEnum(ReportReason),
    comments: z.string().trim().max(500).optional(),
  })
  .refine(
    (value) => Boolean(value.reportedPostId) !== Boolean(value.reportedCommentId),
    { message: "Report exactly one post or comment." },
  )

export async function submitReport(formData: FormData) {
  const { user } = await validateRequest()

  if (!user) {
    return { error: "Unauthorized" }
  }

  const rateLimit = await claimRateLimit({
    namespace: "report:create",
    identifier: user.id,
    limit: 5,
    windowMs: 60 * 60 * 1_000,
  })
  if (!rateLimit.allowed) {
    return { error: "Report limit reached. Please try again later." }
  }

  const reportedPostId = formData.get("reportedPostId") as string | undefined
  const reportedCommentId = formData.get("reportedCommentId") as string | undefined
  const reason = formData.get("reason") as ReportReason
  const comments = formData.get("comments") as string | undefined

  const parsed = reportSchema.safeParse({
    reportedPostId: reportedPostId || undefined,
    reportedCommentId: reportedCommentId || undefined,
    reason,
    comments: comments || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { data } = parsed

  try {
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: user.id,
        reportedPostId: data.reportedPostId,
        reportedCommentId: data.reportedCommentId,
      },
      select: { id: true },
    })
    if (existingReport) return { success: true }

    await prisma.report.create({
      data: {
        reportedPostId: data.reportedPostId,
        reportedCommentId: data.reportedCommentId,
        reporterId: user.id,
        reason: data.reason,
        comments: data.comments,
        status: ReportStatus.PENDING,
      },
    })

    revalidatePath("/") // Revalidate paths that might show reports (e.g., admin dashboard)
    return { success: true }
  } catch (error) {
    console.error("Error submitting report:", error)
    return { error: "Failed to submit report." }
  }
}

export async function updateReportStatus(reportId: string, status: ReportStatus) {
  const { user } = await validateRequest()

  if (!isAdminUser(user)) {
    return { error: "Unauthorized" }
  }

  if (!Object.values(ReportStatus).includes(status)) {
    return { error: "Invalid report status" }
  }

  try {
    await prisma.report.update({
      where: { id: reportId },
      data: { status },
    })
    revalidatePath("/admin/reports")
    return { success: true }
  } catch (error) {
    console.error("Error updating report status:", error)
    return { error: "Failed to update report status." }
  }
}

export async function deleteReport(reportId: string) {
  const { user } = await validateRequest()

  if (!isAdminUser(user)) {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.report.delete({
      where: { id: reportId },
    })
    revalidatePath("/admin/reports")
    return { success: true }
  } catch (error) {
    console.error("Error deleting report:", error)
    return { error: "Failed to delete report." }
  }
}

export async function deleteReportedContent(reportId: string) {
  const { user } = await validateRequest()

  if (!isAdminUser(user)) {
    return { error: "Unauthorized" }
  }

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { reportedPostId: true, reportedCommentId: true },
    })

    if (!report) {
      return { error: "Report not found." }
    }

    if (report.reportedPostId) {
      await prisma.post.delete({
        where: { id: report.reportedPostId },
      })
    } else if (report.reportedCommentId) {
      await prisma.comment.delete({
        where: { id: report.reportedCommentId },
      })
    } else {
      return { error: "No content associated with this report." }
    }

    // Also delete the report itself after deleting content
    await prisma.report.delete({
      where: { id: reportId },
    })

    revalidatePath("/admin/reports")
    revalidatePath("/") // Revalidate home/feed if a post was deleted
    return { success: true }
  } catch (error) {
    console.error("Error deleting reported content:", error)
    return { error: "Failed to delete reported content." }
  }
}
