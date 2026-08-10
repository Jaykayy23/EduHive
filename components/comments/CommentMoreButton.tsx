import { CommentData } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import DeleteCommentDialog from "./DeleteCommentDialog";

interface CommentMoreButtonProps {
  comment: CommentData;
  className?: string;
}

export default function CommentMoreButton({
  comment,
  className,
}: CommentMoreButtonProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            className={cn("hover:translate-y-0 hover:shadow-none", className)}
            aria-label="Comment options"
          >
            <MoreHorizontal className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 />
              Delete comment
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteCommentDialog
        comment={comment}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
