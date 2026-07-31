import { NextResponse } from "next/server"
import { validateRequest } from "@/lib/auth-server"
import { chatSessionIdSchema } from "@/lib/chat-session-schema"
import prisma from "@/lib/prisma"

export async function DELETE(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { user } = await validateRequest()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { sessionId } = await params
  if (!chatSessionIdSchema.safeParse(sessionId).success) {
    return NextResponse.json({ error: "Chat session not found." }, { status: 404 })
  }

  try {
    const result = await prisma.chatSession.deleteMany({
      where: { id: sessionId, userId: user.id },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: "Chat session not found." }, { status: 404 })
    }

    return NextResponse.json({ message: "Chat session deleted." })
  } catch (error) {
    console.error("Error deleting chat session", error)
    return NextResponse.json({ error: "Unable to delete chat session." }, { status: 500 })
  }
}
