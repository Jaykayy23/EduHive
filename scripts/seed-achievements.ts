import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🏆 Seeding achievements...")

  // Check if achievements already exist
  const existingCount = await prisma.achievement.count()
  if (existingCount > 0) {
    console.log("✅ Achievements already exist, skipping seed...")
    return
  }

  const achievements = [
    // Posting achievements
    {
      id: "first_post",
      name: "First Buzz",
      description: "Share your first post on EduHive",
      icon: "🐝",
      category: "POSTING",
      rarity: "COMMON",
      points: 10,
    },
    {
      id: "prolific_poster",
      name: "Prolific Poster",
      description: "Share 10 posts",
      icon: "📝",
      category: "POSTING",
      rarity: "COMMON",
      points: 25,
    },
    {
      id: "content_creator",
      name: "Content Creator",
      description: "Share 50 posts",
      icon: "✍️",
      category: "POSTING",
      rarity: "UNCOMMON",
      points: 100,
    },

    // Engagement achievements
    {
      id: "first_like",
      name: "First Appreciation",
      description: "Give your first like",
      icon: "❤️",
      category: "ENGAGEMENT",
      rarity: "COMMON",
      points: 5,
    },
    {
      id: "supportive",
      name: "Supportive",
      description: "Give 50 likes",
      icon: "👍",
      category: "ENGAGEMENT",
      rarity: "COMMON",
      points: 25,
    },
    {
      id: "first_comment",
      name: "Conversation Starter",
      description: "Leave your first comment",
      icon: "💬",
      category: "ENGAGEMENT",
      rarity: "COMMON",
      points: 10,
    },

    // Social achievements
    {
      id: "first_follower",
      name: "Making Friends",
      description: "Get your first follower",
      icon: "👥",
      category: "SOCIAL",
      rarity: "COMMON",
      points: 15,
    },
    {
      id: "first_follow",
      name: "Explorer",
      description: "Follow your first user",
      icon: "🔍",
      category: "SOCIAL",
      rarity: "COMMON",
      points: 5,
    },

    // Subject achievements
    {
      id: "cs_enthusiast",
      name: "CS Enthusiast",
      description: "Post 5 times about Computer Science",
      icon: "💻",
      category: "SUBJECT",
      rarity: "COMMON",
      points: 30,
    },
    {
      id: "math_wizard",
      name: "Math Wizard",
      description: "Post 5 times about Mathematics",
      icon: "📐",
      category: "SUBJECT",
      rarity: "COMMON",
      points: 30,
    },
  ] as const

  // Create achievements
  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement,
    })
    console.log(`✅ Created: ${achievement.name}`)
  }

  console.log(`🎉 Successfully seeded ${achievements.length} achievements!`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
