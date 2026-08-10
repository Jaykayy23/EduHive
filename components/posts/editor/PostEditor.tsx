"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import LoadingButton from "@/components/LoadingButton";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ACADEMIC_SUBJECTS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Placeholder } from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useDropzone } from "@uploadthing/react";
import { Hash, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { type ClipboardEvent, useEffect, useRef, useState } from "react";
import { BookLoader } from "@/components/ui/book-loader";
import "./styles.css";
import { useSubmitPostMutation } from "./mutations";
import useMediaUpload, { type Attachment } from "./useMediaUpload";

export default function PostEditor() {
  const { user } = useSession();
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const mutation = useSubmitPostMutation();

  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUploads,
  } = useMediaUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  });

  const rootProps = getRootProps();
  delete rootProps.onClick;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder:
          "Ask a question, share notes, or explain what you learned.",
      }),
    ],
    immediatelyRender: false,
  });

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  function onSubmit() {
    mutation.mutate(
      {
        content: input,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          resetMediaUploads();
        },
      },
    );
  }

  function onPaste(event: ClipboardEvent<HTMLDivElement>) {
    const files = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (files.length) startUpload(files);
  }

  function insertSubjectTag(subject: string) {
    const tag = `#${subject.replace(/\s+/g, "")} `;
    editor?.commands.insertContent(tag);
    setShowSubjectSuggestions(false);
    editor?.commands.focus();
  }

  return (
    <Card className="rounded-premium border-border/70 bg-card/95 shadow-soft gap-0 overflow-hidden py-0">
      <CardHeader className="gap-1 px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
        <CardTitle className="text-base">Share with your hive</CardTitle>
        <CardDescription>
          Start a discussion, ask for help, or share something useful.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-4 pb-4 sm:px-5 sm:pb-5">
        <div className="flex items-start gap-3">
          <UserAvatar
            avatarUrl={user.avatarUrl}
            size={40}
            className="ring-border mt-1 ring-1"
          />
          <div
            {...rootProps}
            className={cn(
              "border-border bg-background focus-within:border-primary/40 focus-within:ring-ring/20 min-w-0 flex-1 rounded-xl border transition-[border-color,box-shadow] focus-within:ring-2",
              isDragActive &&
                "border-primary/50 bg-primary/5 ring-primary/20 ring-2",
            )}
          >
            <EditorContent
              editor={editor}
              className="max-h-[20rem] min-h-28 w-full overflow-y-auto px-4 py-3 text-sm leading-6 sm:text-base [&_.tiptap]:min-h-20"
              onPaste={onPaste}
            />
            <input {...getInputProps()} />
          </div>
        </div>

        {showSubjectSuggestions && (
          <section
            className="border-border/70 bg-muted/35 rounded-xl border p-3"
            aria-label="Subject tag suggestions"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Add a subject tag</p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="hover:translate-y-0 hover:shadow-none"
                onClick={() => setShowSubjectSuggestions(false)}
                aria-label="Close subject suggestions"
              >
                <X />
              </Button>
            </div>
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
              {ACADEMIC_SUBJECTS.slice(1).map((subject) => (
                <Button
                  key={subject.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full hover:translate-y-0 hover:shadow-none"
                  onClick={() => insertSubjectTag(subject.name)}
                >
                  #{subject.name.replace(/\s+/g, "")}
                </Button>
              ))}
            </div>
          </section>
        )}

        {!!attachments.length && (
          <AttachmentPreviews
            attachments={attachments}
            removeAttachment={removeAttachment}
          />
        )}
      </CardContent>

      <CardFooter className="border-border/60 bg-muted/25 justify-between gap-3 border-t px-3 py-3 sm:px-4 [.border-t]:pt-3">
        <div className="flex min-w-0 items-center gap-1">
          <AddAttachmentsButton
            onFileSelected={startUpload}
            disabled={isUploading || attachments.length >= 5}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hover:translate-y-0 hover:shadow-none"
            onClick={() => setShowSubjectSuggestions((current) => !current)}
            aria-pressed={showSubjectSuggestions}
          >
            <Hash data-icon="inline-start" />
            Topic
          </Button>
          {isUploading && (
            <span
              className="text-muted-foreground ml-1 flex items-center gap-2 text-xs tabular-nums"
              role="status"
              aria-live="polite"
            >
              <BookLoader size="1rem" />
              {uploadProgress ?? 0}%
            </span>
          )}
        </div>

        <LoadingButton
          type="button"
          size="sm"
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!input.trim() || isUploading}
          className="shrink-0"
        >
          Post
        </LoadingButton>
      </CardFooter>
    </Card>
  );
}

interface AddAttachmentsButtonProps {
  onFileSelected: (files: File[]) => void;
  disabled: boolean;
}

function AddAttachmentsButton({
  onFileSelected,
  disabled,
}: AddAttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hover:translate-y-0 hover:shadow-none"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon data-icon="inline-start" />
        Media
      </Button>
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        ref={fileInputRef}
        className="sr-only"
        aria-label="Add images or videos"
        onChange={(event) => {
          const files = Array.from(event.target.files || []);
          if (files.length) {
            onFileSelected(files);
            event.target.value = "";
          }
        }}
      />
    </>
  );
}

interface AttachmentPreviewsProps {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}

function AttachmentPreviews({
  attachments,
  removeAttachment,
}: AttachmentPreviewsProps) {
  return (
    <div
      className={cn(
        "grid gap-2 overflow-hidden rounded-xl",
        attachments.length > 1 && "grid-cols-2",
      )}
    >
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.file.name}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  );
}

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemoveClick: () => void;
}

function AttachmentPreview({
  attachment: { file, isUploading },
  onRemoveClick,
}: AttachmentPreviewProps) {
  const [src] = useState(() => URL.createObjectURL(file));

  useEffect(() => () => URL.revokeObjectURL(src), [src]);

  return (
    <div
      className={cn(
        "bg-muted relative aspect-[16/10] overflow-hidden",
        isUploading && "opacity-60",
      )}
      aria-busy={isUploading}
    >
      {file.type.startsWith("image") ? (
        <Image
          src={src}
          alt={`Preview of ${file.name}`}
          fill
          sizes="(max-width: 640px) 50vw, 320px"
          className="object-cover"
          unoptimized
        />
      ) : (
        <video
          controls
          className="size-full object-cover"
          aria-label={file.name}
        >
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="bg-background/90 absolute top-2 right-2 rounded-full hover:translate-y-0 hover:shadow-none"
          onClick={onRemoveClick}
          aria-label={`Remove ${file.name}`}
        >
          <X />
        </Button>
      )}
    </div>
  );
}
