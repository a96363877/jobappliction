import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { getApplicationById } from "@/lib/firebase/firestore"
import { DashboardHeader } from "@/components/dashboard/header"
import { ApplicationDetails } from "@/components/dashboard/application-details"

export default async function ApplicationPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  // If user is not authenticated or not an admin, redirect to login
  if (!session || session.user.role !== "admin") {
    redirect("/login")
  }

  const application = await getApplicationById(params.id)

  if (!application) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={session.user} />
      <div className="container flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Application Details</h2>
        </div>
        <div className="border-b pb-4">
          <p className="text-muted-foreground">Review the complete application details and attached documents.</p>
        </div>
        <ApplicationDetails application={application} />
      </div>
    </div>
  )
}
