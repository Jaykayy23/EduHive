import { validateRequest } from "@/app/auth"
import prisma from "@/lib/prisma"
import type { ReportData } from "@/lib/types"
import {getReportDataInclude} from "@/lib/types"
import { redirect } from "next/navigation"
import { ReportTable } from "@/components/admin/ReportTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic" // Ensure data is always fresh

export default async function AdminReportsPage() {
  const { user } = await validateRequest()

  // Basic admin check: redirect if not logged in or not an admin
  // Replace "admin" with your actual admin user check
  if (!user || user.username !== "jaykayy") {
    redirect("/login") // Or show an unauthorized message
  }

  const reports: ReportData[] = await prisma.report.findMany({
    include: getReportDataInclude(user.id),
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <main className="flex w-full min-w-0 flex-col gap-5 p-5">
      <Card className="w-full rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Content Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No reports found.</p>
          ) : (
            <ReportTable reports={reports} />
          )}
        </CardContent>
      </Card>
    </main>
  )
}
