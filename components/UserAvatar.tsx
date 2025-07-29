"use client"

import Image from "next/image"
import avatarPlaceholder from "@/public/images/avatar-placeholder.png"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface UserAvatarProps {
  avatarUrl: string | null | undefined
  size?: number
  className?: string
}

export default function UserAvatar({ avatarUrl, size, className }: UserAvatarProps) {
  const [imgSrc, setImgSrc] = useState(avatarUrl || avatarPlaceholder)

  const handleError = () => {
    setImgSrc(avatarPlaceholder)
  }

  return (
    <Image
      src={imgSrc || "/placeholder.svg"}
      alt="User Avatar"
      width={size ?? 48}
      height={size ?? 48}
      className={cn("bg-secondary aspect-square h-fit flex-none rounded-full object-cover", className)}
      onError={handleError}
    />
  )
}
