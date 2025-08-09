"use client"

import { type ReportData, ReportStatus } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatRelativeDate } from "@/lib/utils"
import Link from "next/link"
import { ReportActions } from "./ReportActions"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ReportTableProps {
  reports: ReportData[]
}

export function ReportTable({ reports }: ReportTableProps) {
  return (
    <ScrollArea className="h-[calc(100vh-200px)] rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Reported Content</TableHead>
            <TableHead className="w-[120px]">Reason</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[150px]">Reporter</TableHead>
            <TableHead className="w-[120px]">Reported At</TableHead>
            <TableHead>Comments</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">
                {report.reportedPost ? (
                  <Link href={`/posts/${report.reportedPost.id}`} className="hover:underline">
                    <div className="line-clamp-2 max-w-[150px] break-words">{report.reportedPost.content}</div>
                    <span className="text-muted-foreground text-xs">
                      (Post by @{report.reportedPost.user.username})
                    </span>
                  </Link>
                ) : report.reportedComment ? (
                  <Link href={`/posts/${report.reportedComment.postId}`} className="hover:underline">
                    <div className="line-clamp-2 max-w-[150px] break-words">{report.reportedComment.content}</div>
                    <span className="text-muted-foreground text-xs">
                      (Comment by @{report.reportedComment.user.username})
                    </span>
                  </Link>
                ) : (
                  "N/A"
                )}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{report.reason.replace(/_/g, " ")}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    report.status === ReportStatus.PENDING
                      ? "default"
                      : report.status === ReportStatus.DISMISSED
                        ? "outline"
                        : report.status === ReportStatus.DELETED
                          ? "destructive"
                          : "secondary"
                  }
                >
                  {report.status.replace(/_/g, " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <Link href={`/users/${report.reporter.username}`} className="hover:underline">
                  @{report.reporter.username}
                </Link>
              </TableCell>
              <TableCell>{formatRelativeDate(report.createdAt)}</TableCell>
              <TableCell className="text-muted-foreground text-sm max-w-[200px] break-words">
                {report.comments || "No comments"}
              </TableCell>
              <TableCell className="text-right">
                <ReportActions report={report} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}
