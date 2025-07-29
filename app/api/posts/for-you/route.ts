import { validateRequest } from "@/app/auth"
import prisma from "@/lib/prisma"
import { getPostDataInclude, type PostsPage, ACADEMIC_SUBJECTS } from "@/lib/types"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined
    const subject = req.nextUrl.searchParams.get("subject") || undefined

    const pageSize = 10
    const { user } = await validateRequest()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Build where clause based on subject filter
    let whereClause: any = {}

    if (subject && subject !== "all") {
      // Check if the subject is valid
      const validSubject = ACADEMIC_SUBJECTS.find((s) => s.id === subject)
      if (!validSubject) {
        return Response.json({ error: "Invalid subject filter" }, { status: 400 })
      }

      // Create search terms for the subject
      const subjectTerms = getSubjectSearchTerms(subject)

      // Use simpler ILIKE queries instead of full-text search
      whereClause = {
        OR: subjectTerms.map((term) => ({
          content: {
            contains: term,
            mode: "insensitive" as const,
          },
        })),
      }
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    })

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    }

    return Response.json(data)
  } catch (error) {
    console.error("For-you API error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to get search terms for each subject
function getSubjectSearchTerms(subject: string): string[] {
  const searchTermsMap: Record<string, string[]> = {
    "computer-science": [
      "programming",
      "coding",
      "software",
      "algorithm",
      "javascript",
      "python",
      "react",
      "database",
      "AI",
      "machine learning",
      "computer science",
      "ComputerScience",
      "tech",
      "development",
      "code",
      "app",
      "web",
      "cybersecurity",
    ],
    mathematics: [
      "math",
      "mathematics",
      "Mathematics",
      "calculus",
      "algebra",
      "geometry",
      "statistics",
      "equation",
      "theorem",
      "proof",
      "number",
      "formula",
      "linear algebra",
      "discrete math",
    ],
    physics: [
      "physics",
      "Physics",
      "quantum",
      "mechanics",
      "thermodynamics",
      "electricity",
      "magnetism",
      "relativity",
      "energy",
      "force",
      "motion",
      "wave",
      "astrophysics",
      "optics",
    ],
    chemistry: [
      "chemistry",
      "Chemistry",
      "chemical",
      "molecule",
      "atom",
      "reaction",
      "organic",
      "inorganic",
      "periodic table",
      "compound",
      "element",
      "lab",
      "synthesis",
      "acid",
      "base",
      "pH",
    ],
    biology: [
      "biology",
      "Biology",
      "cell",
      "DNA",
      "genetics",
      "evolution",
      "organism",
      "anatomy",
      "physiology",
      "ecosystem",
      "species",
      "human body",
      "HumanBiology",
      "microbiology",
      "immunology",
    ],
    biochemistry: [
      "biochemistry",
      "BioChem",
      "protein",
      "enzyme",
      "metabolism",
      "molecular biology",
      "biochemical",
      "amino acid",
      "nucleic acid",
      "protein synthesis",
    ],
    "food-science": [
      "food science",
      "FoodScience",
      "nutrition",
      "food safety",
      "food technology",
      "culinary",
      "diet",
      "cooking",
      "recipe",
      "ingredients",
      "food preservation",
    ],
    agriculture: [
      "agriculture",
      "Agriculture",
      "farming",
      "crop",
      "soil",
      "plant",
      "harvest",
      "livestock",
      "agricultural",
      "farm",
      "cultivation",
      "sustainable farming",
    ],
    engineering: [
      "engineering",
      "Engineering",
      "design",
      "construction",
      "mechanical",
      "electrical",
      "civil",
      "structural",
      "project",
      "technical",
      "aerospace",
      "biomedical",
    ],
    medicine: [
      "medicine",
      "Medicine",
      "medical",
      "health",
      "doctor",
      "patient",
      "treatment",
      "diagnosis",
      "clinical",
      "healthcare",
      "therapy",
      "pharmacology",
      "anatomy",
    ],
    psychology: [
      "psychology",
      "Psychology",
      "mental health",
      "behavior",
      "cognitive",
      "therapy",
      "psychological",
      "brain",
      "mind",
      "emotion",
      "study",
      "neuroscience",
      "cbt",
    ],
  }

  return searchTermsMap[subject] || [subject.replace("-", " ")]
}
