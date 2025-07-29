import { validateRequest } from "@/lib/auth-server"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import type { ChatSession } from "@/lib/chatbot-utils"

export async function GET() {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const chatSessions = await prisma.chatSession.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(chatSessions)
  } catch (error) {
    console.error("Error fetching chat sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: ChatSession = await request.json()

    // Ensure the session belongs to the authenticated user
    if (body.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const upsertedSession = await prisma.chatSession.upsert({
      where: {
        id: body.id,
      },
      update: {
        title: body.title,
        messages: body.messages,
        updatedAt: new Date(),
      },
      create: {
        id: body.id,
        userId: user.id,
        title: body.title,
        messages: body.messages,
        createdAt: new Date(body.createdAt),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(upsertedSession)
  } catch (error) {
    console.error("Error saving chat session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
