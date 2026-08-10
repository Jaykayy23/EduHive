import { useState } from "react";
import { useSubmitCommentMutation } from "./mutations";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { SendHorizonal } from "lucide-react";
import { BookLoader } from "@/components/ui/book-loader";

interface CommentInputProps {
  postId: string;
}

export default function CommentInput({ postId }: CommentInputProps) {
  const [input, setInput] = useState("");

  const mutation = useSubmitCommentMutation(postId);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!input) return;

    mutation.mutate(
      {
        postId,
        content: input,
      },
      {
        onSuccess: () => setInput(""),
      },
    );
  }

  return (
    <form className="flex w-full items-center gap-2" onSubmit={onSubmit}>
      <Input
        placeholder="Write a comment..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="bg-background rounded-full"
      />
      <Button
        type="submit"
        size="icon-sm"
        className="shrink-0 rounded-full hover:translate-y-0 hover:shadow-none"
        disabled={!input.trim() || mutation.isPending}
        aria-label="Post comment"
      >
        {!mutation.isPending ? (
          <SendHorizonal data-icon="inline-start" />
        ) : (
          <BookLoader size="1.25rem" />
        )}
      </Button>
    </form>
  );
}
