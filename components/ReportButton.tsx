"use client";

import { Button } from "@/components/ui/button";
import { ReportDialog } from "@/components/ReportDialog";
import { cn } from "@/lib/utils";
import { Flag } from "lucide-react";

interface ReportButtonProps {
  reportedPostId?: string;
  reportedCommentId?: string;
  className?: string;
}

export function ReportButton({
  reportedPostId,
  reportedCommentId,
  className,
}: ReportButtonProps) {
  return (
    <ReportDialog
      reportedPostId={reportedPostId}
      reportedCommentId={reportedCommentId}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn("hover:translate-y-0 hover:shadow-none", className)}
        title="Report"
      >
        <Flag />
        <span className="sr-only">Report</span>
      </Button>
    </ReportDialog>
  );
}
