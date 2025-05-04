"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Download, FileText, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { updateApplicationStatus } from "@/lib/firebase/firestore"
import { toast } from "@/hooks/use-toast"

interface ApplicationDetailsProps {
  application: any
}

export function ApplicationDetails({ application }: ApplicationDetailsProps) {
  const [status, setStatus] = useState(application.status)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      await updateApplicationStatus(application.id, newStatus)
      setStatus(newStatus)
      toast({
        title: "Status Updated",
        description: `Application status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Update Failed",
        description: "There was an error updating the application status.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Applications
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <Select value={status} onValueChange={handleStatusChange} disabled={isUpdating}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Applicant Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Full Name</h3>
                <p>
                  {application.firstName} {application.lastName}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Email</h3>
                <p>{application.email}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Phone</h3>
                <p>{application.phone}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Date of Birth</h3>
                <p>{format(new Date(application.dateOfBirth), "PPP")}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Address</h3>
                <p>
                  {application.address}, {application.city}, {application.state} {application.zipCode}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div>
              <h3 className="font-medium mb-2">Position Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Position</h3>
                  <p>{application.position}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Employment Type</h3>
                  <p>{application.employmentType}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Salary Expectation</h3>
                  <p>{application.salaryExpectation}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Start Date</h3>
                  <p>{format(new Date(application.startDate), "PPP")}</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div>
              <h3 className="font-medium mb-2">Experience & Qualifications</h3>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Work Experience</h3>
                  <p className="whitespace-pre-line">{application.experience}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Education</h3>
                  <p className="whitespace-pre-line">{application.education}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Skills</h3>
                  <p className="whitespace-pre-line">{application.skills}</p>
                </div>
                {application.references && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">References</h3>
                    <p className="whitespace-pre-line">{application.references}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-3">US ID</h3>
                {application.usId ? (
                  <a
                    href={application.usId}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="mr-2 h-4 w-4" /> View ID
                    </Button>
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">No ID uploaded</p>
                )}
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-3">CV/Resume</h3>
                {application.cv ? (
                  <a
                    href={application.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="mr-2 h-4 w-4" /> View CV
                    </Button>
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">No CV uploaded</p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Application Date</h3>
                <p>{format(new Date(application.createdAt), "PPP")}</p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Application ID</h3>
                <p className="text-xs font-mono">{application.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
