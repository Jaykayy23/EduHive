import kyInstance from "./ky"
import { toast } from "sonner"

export interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  subject?: string
  references?: Reference[]
}

export interface Reference {
  type: "video" | "article"
  title: string
  url: string
  description: string
}

export interface ChatSession {
  id: string
  userId: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export const saveChatSession = async (session: ChatSession) => {
  try {
    await kyInstance.post("/api/chat-sessions", {
      json: {
        id: session.id,
        userId: session.userId, // Ensure userId is sent
        title: session.title,
        messages: session.messages,
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Failed to save chat session:", error)
    toast.error("Failed to save chat session.")
  }
}

export const getChatSessions = async (): Promise<ChatSession[]> => {
  try {
    const response = await kyInstance.get("/api/chat-sessions").json<ChatSession[]>()
    return response.map((session) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      messages: (session.messages as unknown as ChatMessage[]).map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }))
  } catch (error) {
    console.error("Failed to fetch chat sessions:", error)
    toast.error("Failed to load chat history.")
    return []
  }
}

export const deleteChatSession = async (sessionId: string) => {
  try {
    await kyInstance.delete(`/api/chat-sessions/${sessionId}`)
    toast.success("Chat session deleted.")
  } catch (error) {
    console.error("Failed to delete chat session:", error)
    toast.error("Failed to delete chat session.")
  }
}

export const generateSessionTitle = (firstMessage: string): string => {
  const words = firstMessage.split(" ").slice(0, 6).join(" ")
  return words.length > 30 ? words.substring(0, 30) + "..." : words
}

export const detectSubject = (message: string): string | undefined => {
  const subjects = {
    mathematics: [
      "math",
      "mathematics",
      "calculus",
      "algebra",
      "geometry",
      "statistics",
      "linear algebra",
      "probability",
      "discrete math",
      "number theory",
      "topology",
      "complex analysis",
      "numerical analysis",
      "mathematical logic",
    ],
    "computer science": [
      "programming",
      "coding",
      "algorithm",
      "software",
      "computer",
      "machine learning",
      "ai",
      "data structures",
      "operating systems",
      "networks",
      "cybersecurity",
      "javascript",
      "python",
      "react",
      "database",
      "web development",
      "frontend",
      "backend",
      "devops",
      "cloud computing",
    ],
    physics: [
      "physics",
      "quantum",
      "mechanics",
      "electromagnetism",
      "thermodynamics",
      "relativity",
      "statistical mechanics",
      "solid state physics",
      "nuclear physics",
      "particle physics",
      "astrophysics",
      "optics",
      "fluid dynamics",
      "cosmology",
      "condensed matter",
    ],
    chemistry: [
      "chemistry",
      "chemical",
      "molecule",
      "atom",
      "reaction",
      "organic chemistry",
      "inorganic chemistry",
      "physical chemistry",
      "analytical chemistry",
      "biochemistry",
      "materials chemistry",
      "environmental chemistry",
      "medicinal chemistry",
      "polymer chemistry",
      "electrochemistry",
      "spectroscopy",
      "periodic table",
      "compound",
      "element",
      "lab",
      "synthesis",
      "bonding",
    ],
    biology: [
      "biology",
      "cell",
      "dna",
      "genetics",
      "evolution",
      "ecology",
      "physiology",
      "microbiology",
      "immunology",
      "neuroscience",
      "developmental biology",
      "bioinformatics",
      "biotechnology",
      "molecular biology",
      "human body",
      "anatomy",
      "zoology",
      "botany",
      "virology",
    ],
    engineering: [
      "engineering",
      "mechanical",
      "electrical",
      "civil",
      "chemical engineering",
      "aerospace engineering",
      "biomedical engineering",
      "environmental engineering",
      "industrial engineering",
      "materials engineering",
      "software engineering",
      "systems engineering",
      "design",
      "construction",
      "project",
      "technical",
      "robotics",
      "automation",
      "thermodynamics",
      "fluid mechanics",
    ],
  }

  const lowerMessage = message.toLowerCase()

  for (const [subject, keywords] of Object.entries(subjects)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      return subject
    }
  }

  return undefined
}

export const extractReferences = (content: string): Reference[] => {
  const references: Reference[] = []
  const lines = content.split("\n")

  let currentRef: Partial<Reference> = {}
  let inReferencesSection = false

  for (const line of lines) {
    if (line.includes("📚 **Helpful Resources:**")) {
      inReferencesSection = true
      continue
    }

    if (inReferencesSection) {
      if (line.includes("🎥") || line.includes("📄")) {
        if (currentRef.title && currentRef.url && currentRef.description) {
          references.push(currentRef as Reference)
        }
        currentRef = {
          type: line.includes("🎥") ? "video" : "article",
          title: line.replace(/[🎥📄*]/gu, "").trim(),
          description: "", // Reset description for new ref
          url: "", // Reset url for new ref
        }
      } else if (line.includes("🔗") && currentRef.title) {
        currentRef.url = line.replace("🔗", "").trim()
      } else if (line.trim() && currentRef.title && !currentRef.description) {
        currentRef.description = line.trim()
      }
    }
  }

  if (currentRef.title && currentRef.url && currentRef.description) {
    references.push(currentRef as Reference)
  }

  return references
}
