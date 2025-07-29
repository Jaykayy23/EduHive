import { type NextRequest, NextResponse } from "next/server"
import { validateRequest } from "@/lib/auth-server"
import { universityEducationalDataset, getReferences } from "@/lib/educational-dataset"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
}

// Enhanced AI response generator with educational context
function generateEducationalResponse(userMessage: string, conversationHistory: ChatMessage[]): string {
  const message = userMessage.toLowerCase()

  // Detect subject and topic
  const subjects = Object.keys(universityEducationalDataset.subjects)
  let detectedSubject = ""
  let detectedTopic = ""

  for (const subject of subjects) {
    const subjectData =
      universityEducationalDataset.subjects[subject as keyof typeof universityEducationalDataset.subjects]

    // Check if message contains subject keywords
    if (subjectData.keywords.some((keyword) => message.includes(keyword.toLowerCase()))) {
      detectedSubject = subject

      // Find specific topic
      const foundTopic = subjectData.topics.find((topic) => message.includes(topic.toLowerCase()))
      if (foundTopic) {
        detectedTopic = foundTopic
          .toLowerCase()
          .replace(/\s+/g, "")
          .replace(/[^a-z]/g, "")
      }
      break
    }
  }

  // Generate contextual response based on detected subject
  let response = ""

  if (detectedSubject) {
    const subjectData =
      universityEducationalDataset.subjects[detectedSubject as keyof typeof universityEducationalDataset.subjects]

    // Provide relevant concepts
    if (
      detectedTopic &&
      subjectData.concepts &&
      subjectData.concepts[detectedTopic as keyof typeof subjectData.concepts]
    ) {
      const concepts = subjectData.concepts[detectedTopic as keyof typeof subjectData.concepts] as string[]
      response = `Great question about ${detectedSubject}! Here's what you should know:\n\n`
      response += concepts
        .slice(0, 3)
        .map((concept, index) => `${index + 1}. ${concept}`)
        .join("\n\n")
    } else {
      // General subject response
      response = `I'd be happy to help you with ${subjectData.topics[0].split(" ")[0]} in ${detectedSubject}! This field covers many important topics including:\n\n`
      response += subjectData.topics
        .slice(0, 6)
        .map((topic, index) => `• ${topic}`)
        .join("\n")
      response += `\n\nWhat specific aspect would you like to explore further?`
    }
  } else {
    // General educational responses
    if (message.includes("study") || message.includes("learn")) {
      const tips = universityEducationalDataset.studyTips.slice(0, 3)
      response = "Here are some effective study strategies for university students:\n\n"
      response += tips.map((tip, index) => `${index + 1}. ${tip}`).join("\n\n")
    } else if (message.includes("exam") || message.includes("test")) {
      const tips = universityEducationalDataset.examTips.slice(0, 3)
      response = "Here are some proven exam preparation strategies:\n\n"
      response += tips.map((tip, index) => `${index + 1}. ${tip}`).join("\n\n")
    } else if (message.includes("research")) {
      const tips = universityEducationalDataset.researchTips.slice(0, 3)
      response = "Here are some essential research tips for university students:\n\n"
      response += tips.map((tip, index) => `${index + 1}. ${tip}`).join("\n\n")
    } else {
      response = "Hello! I'm EduHive AI, your university study companion. I can help you with:\n\n"
      response += "• Mathematics (Calculus, Linear Algebra, Statistics)\n"
      response += "• Computer Science (Algorithms, Programming, ML)\n"
      response += "• Physics (Quantum Mechanics, Electromagnetism)\n"
      response += "• Chemistry (Organic, Physical, Analytical)\n"
      response += "• Biology (Molecular Biology, Genetics)\n"
      response += "• Engineering (Mechanical, Electrical, Civil)\n"
      response += "• Study techniques and exam preparation\n\n"
      response += "What would you like to learn about today?"
    }
  }

  return response
}

function addReferences(response: string, subject: string, topic?: string): string {
  const references = getReferences(subject, topic)

  if (references.length > 0) {
    response += "\n\n📚 **Helpful Resources:**\n"
    references.slice(0, 2).forEach((ref, index) => {
      const emoji = ref.type === "video" ? "🎥" : "📄"
      response += `\n${emoji} **${ref.title}**\n`
      response += `   ${ref.description}\n`
      response += `   🔗 ${ref.url}\n`
    })
  }

  return response
}

export async function POST(request: NextRequest) {
  try {
    // Validate user authentication
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: ChatRequest = await request.json()

    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    const lastMessage = body.messages[body.messages.length - 1]

    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json({ error: "Last message must be from user" }, { status: 400 })
    }

    // Generate educational response
    let response = generateEducationalResponse(lastMessage.content, body.messages)

    // Detect subject for references
    const message = lastMessage.content.toLowerCase()
    const subjects = Object.keys(universityEducationalDataset.subjects)

    for (const subject of subjects) {
      const subjectData =
        universityEducationalDataset.subjects[subject as keyof typeof universityEducationalDataset.subjects]
      if (subjectData.keywords.some((keyword) => message.includes(keyword.toLowerCase()))) {
        response = addReferences(response, subject)
        break
      }
    }

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      subject: subjects.find((s) => message.includes(s)) || "general",
    })
  } catch (error) {
    console.error("Chatbot API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
