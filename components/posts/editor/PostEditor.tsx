"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extension-placeholder"
import { useSession } from "@/app/(main)/SessionProvider"
import UserAvatar from "@/components/UserAvatar"
import "./styles.css"
import { useSubmitPostMutation } from "./mutations"
import LoadingButton from "@/components/LoadingButton"
import useMediaUpload, { type Attachment } from "./useMediaUpload"
import { type ClipboardEvent, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ImageIcon, Loader2, X, Hash } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useDropzone } from "@uploadthing/react"
import { ACADEMIC_SUBJECTS } from "@/lib/types"

export default function PostEditor() {
  const { user } = useSession()
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false)

  const mutation = useSubmitPostMutation()

  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUploads,
  } = useMediaUpload()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  })

  const { onClick, ...rootProps } = getRootProps()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Got something to share? Buzz it here! 🐝 (Try adding #ComputerScience or other subject tags)",
      }),
    ],
    immediatelyRender: false,
  })

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || ""

  function onSubmit() {
    mutation.mutate(
      {
        content: input,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent()
          resetMediaUploads()
        },
      },
    )
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[]
    startUpload(files)
  }

  function insertSubjectTag(subject: string) {
    const tag = `#${subject.replace(/\s+/g, "")} `
    editor?.commands.insertContent(tag)
    setShowSubjectSuggestions(false)
    editor?.commands.focus()
  }

  return (
    <div className="bg-card flex flex-col gap-5 rounded-2xl p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline-flex" />
        <div {...rootProps} className="w-full">
          <EditorContent
            editor={editor}
            className={cn(
              "bg-background max-h-[20rem] w-full overflow-y-auto rounded-2xl px-5 py-3",
              isDragActive && "outline-dashed",
            )}
            onPaste={onPaste}
          />
          <input {...getInputProps()} />
        </div>
      </div>

      {/* Subject Tag Suggestions */}
      {showSubjectSuggestions && (
        <div className="bg-muted rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-2">Quick subject tags:</p>
          <div className="flex flex-wrap gap-2">
            {ACADEMIC_SUBJECTS.slice(1).map((subject) => (
              <button
                key={subject.id}
                onClick={() => insertSubjectTag(subject.name)}
                className="flex items-center gap-1 px-3 py-1 bg-background rounded-full text-sm hover:bg-accent transition-colors"
              >
                <span>{subject.emoji}</span>
                <span>#{subject.name.replace(/\s+/g, "")}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!!attachments.length && <AttachmentPreviews attachments={attachments} removeAttachment={removeAttachment} />}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isUploading && (
            <>
              <span className="text-sm">{uploadProgress ?? 0}%</span>
              <Loader2 className="text-primary size-5 animate-spin" />
            </>
          )}
          <AddAttachmentsButton onFileSelected={startUpload} disabled={isUploading || attachments.length >= 5} />
          <Button
            variant="ghost"
            size="icon"
            className="text-primary hover:text-primary"
            onClick={() => setShowSubjectSuggestions(!showSubjectSuggestions)}
            title="Add subject tags"
          >
            <Hash size={20} />
          </Button>
        </div>

        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!input.trim() || isUploading}
          className="min-w-20"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  )
}

interface AddAttachmentsButtonProps {
  onFileSelected: (files: File[]) => void
  disabled: boolean
}

function AddAttachmentsButton({ onFileSelected, disabled }: AddAttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary hover:text-primary"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon size={20} />
      </Button>
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        ref={fileInputRef}
        className="sr-only hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          if (files.length) {
            onFileSelected(files)
            e.target.value = ""
          }
        }}
      />
    </>
  )
}

interface AttachmentPreviewsProps {
  attachments: Attachment[]
  removeAttachment: (fileName: string) => void
}

function AttachmentPreviews({ attachments, removeAttachment }: AttachmentPreviewsProps) {
  return (
    <div className={cn("flex flex-col gap-3", attachments.length > 1 && "sm:grid sm:grid-cols-2")}>
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.file.name}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  )
}

interface AttachmentPreviewProps {
  attachment: Attachment
  onRemoveClick: () => void
}

function AttachmentPreview({ attachment: { file, mediaId, isUploading }, onRemoveClick }: AttachmentPreviewProps) {
  const src = URL.createObjectURL(file)

  return (
    <div className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}>
      {file.type.startsWith("image") ? (
        <Image
          src={src || "/placeholder.svg"}
          alt="Attachment preview"
          width={500}
          height={500}
          className="size-fit max-h-[30rem] rounded-2xl"
        />
      ) : (
        <video controls className="size-fit max-h-[30rem] rounded-2xl">
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="bg-foreground text-background hover:bg-foreground/60 absolute top-3 right-3 rounded-full p-1.5 transition-colors"
        >
          <X size={20} />
        </button>
      )}
    </div>
  )
}
