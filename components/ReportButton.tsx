"use client"

import { Button } from "@/components/ui/button"
import { ReportDialog } from "@/components/ReportDialog"
import { Flag } from "lucide-react"

interface ReportButtonProps {
  reportedPostId?: string
  reportedCommentId?: string
  className?: string
}

export function ReportButton({ reportedPostId, reportedCommentId, className }: ReportButtonProps) {
  return (
    <ReportDialog reportedPostId={reportedPostId} reportedCommentId={reportedCommentId}>
      <Button variant="ghost" size="icon" className={className} title="Report">
        <Flag className="size-4" />
        <span className="sr-only">Report</span>
      </Button>
    </ReportDialog>
  )
}
