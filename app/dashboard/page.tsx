import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/header"
import { ApplicationsTable } from "@/components/dashboard/applications-table"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  // If user is not authenticated or not an admin, redirect to login
  if (!session || session.user.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={session.user} />
      <div className="container flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Applications Dashboard</h2>
        </div>
        <div className="border-b pb-4">
          <p className="text-muted-foreground">Manage and review all job applications submitted through the system.</p>
        </div>
        <ApplicationsTable />
      </div>
    </div>
  )
}
