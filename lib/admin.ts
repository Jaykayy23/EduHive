type AdminCandidate = {
  id: string
} | null

function getAdminUserIds(): Set<string> {
  return new Set(
    (process.env.ADMIN_USER_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  )
}

export function isAdminUser(user: AdminCandidate): boolean {
  return Boolean(user && getAdminUserIds().has(user.id))
}
