"use client"

import type React from "react"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ReportReason } from "@/lib/types"
import { submitReport } from "@/reports/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface ReportDialogProps {
  reportedPostId?: string
  reportedCommentId?: string
  children: React.ReactNode
}

export function ReportDialog({ reportedPostId, reportedCommentId, children }: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason | "">("")
  const [comments, setComments] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) {
      toast.error("Please select a reason for the report.")
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      if (reportedPostId) formData.append("reportedPostId", reportedPostId)
      if (reportedCommentId) formData.append("reportedCommentId", reportedCommentId)
      formData.append("reason", reason)
      if (comments) formData.append("comments", comments)

      const result = await submitReport(formData)

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Report submitted successfully!")
        setIsOpen(false)
        setReason("")
        setComments("")
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Please select a reason for reporting this content. Your report helps us keep the platform safe.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Reason
            </Label>
            <Select onValueChange={(value: ReportReason) => setReason(value)} value={reason}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ReportReason).map((r) => (
                  <SelectItem key={r} value={r}>
                    {r.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comments" className="text-right">
              Comments (Optional)
            </Label>
            <Textarea
              id="comments"
              placeholder="Provide additional details..."
              className="col-span-3"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending || !reason}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
