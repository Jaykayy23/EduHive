import { validateRequest } from "@/lib/auth-server"
import  prisma  from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId } = params

    // Verify that the session belongs to the authenticated user
    const sessionToDelete = await prisma.chatSession.findUnique({
      where: {
        id: sessionId,
      },
    })

    if (!sessionToDelete) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 })
    }

    if (sessionToDelete.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this chat session" }, { status: 403 })
    }

    await prisma.chatSession.delete({
      where: {
        id: sessionId,
      },
    })

    return NextResponse.json({ message: "Chat session deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting chat session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
