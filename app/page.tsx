import { redirect } from "next/navigation"
import JobApplicationForm from "@/components/job-application-form"
export default async function Home() {


  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Professional Job Application</h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Complete the form below to apply for a position with our company. All information will be kept
              confidential.
            </p>
          </div>
          <JobApplicationForm />
        </div>
      </div>
    </main>
  )
}
