import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { validateRequest } from "@/lib/auth-server"
import { chatSessionPayloadSchema } from "@/lib/chat-session-schema"
import prisma from "@/lib/prisma"

const MAX_CHAT_SESSION_BODY_BYTES = 1_000_000

export async function GET() {
  try {
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const chatSessions = await prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 50,
    })

    return NextResponse.json(chatSessions)
  } catch (error) {
    console.error("Error fetching chat sessions", error)
    return NextResponse.json({ error: "Unable to load chat history." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { user } = await validateRequest()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const contentLength = Number(request.headers.get("content-length"))
  if (Number.isFinite(contentLength) && contentLength > MAX_CHAT_SESSION_BODY_BYTES) {
    return NextResponse.json({ error: "Chat history is too large." }, { status: 413 })
  }

  try {
    const body = chatSessionPayloadSchema.parse(await request.json())
    const existingSession = await prisma.chatSession.findUnique({
      where: { id: body.id },
      select: { userId: true },
    })

    // Do not reveal whether another user owns a session ID.
    if (existingSession && existingSession.userId !== user.id) {
      return NextResponse.json({ error: "Chat session not found." }, { status: 404 })
    }

    const messages = JSON.parse(JSON.stringify(body.messages))
    const chatSession = existingSession
      ? await prisma.chatSession.update({
          where: { id: body.id },
          data: { title: body.title, messages },
        })
      : await prisma.chatSession.create({
          data: { id: body.id, userId: user.id, title: body.title, messages },
        })

    return NextResponse.json(chatSession)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid chat session." }, { status: 400 })
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON request body." }, { status: 400 })
    }

    console.error("Error saving chat session", error)
    return NextResponse.json({ error: "Unable to save chat history." }, { status: 500 })
  }
}
