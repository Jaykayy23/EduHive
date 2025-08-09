"use client";

import { type ReportData, ReportStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Check, X, Trash, Ban, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteReport, deleteReportedContent, updateReportStatus } from "@/reports/actions";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";

interface ReportActionsProps {
  report: ReportData;
}

export function ReportActions({ report }: ReportActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (status: ReportStatus) => {
    startTransition(async () => {
      const result = await updateReportStatus(report.id, status);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Report status updated to ${status.replace(/_/g, " ")}.`);
      }
    });
  };

  const handleDeleteReport = () => {
    startTransition(async () => {
      const result = await deleteReport(report.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Report deleted.");
      }
    });
  };

  const handleDeleteReportedContent = () => {
    startTransition(async () => {
      const result = await deleteReportedContent(report.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Reported content and report deleted.");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {report.status === ReportStatus.PENDING && (
          <>
            <DropdownMenuItem onClick={() => handleUpdateStatus(ReportStatus.APPROVED)} disabled={isPending}>
              <Check className="mr-2 h-4 w-4" /> Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUpdateStatus(ReportStatus.DISMISSED)} disabled={isPending}>
              <X className="mr-2 h-4 w-4" /> Dismiss
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleUpdateStatus(ReportStatus.DELETED)} disabled={isPending}>
              <Ban className="mr-2 h-4 w-4" /> Mark as Deleted
            </DropdownMenuItem>
          </>
        )}
        {/* Delete Report Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={e => e.preventDefault()} disabled={isPending}>
              <Trash className="mr-2 h-4 w-4" /> Delete Report
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the report entry.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDeleteReport}
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Delete Reported Content AlertDialog */}
        {(report.reportedPostId || report.reportedCommentId) && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={e => e.preventDefault()} disabled={isPending}>
                <Trash className="mr-2 h-4 w-4" /> Delete Reported Content
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the reported content (post or comment) and this report.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteReportedContent}
                  disabled={isPending}
                >
                  {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Delete Content
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
