"use client"

import type React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  CalendarIcon,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
  User,
  MapPin,
  Briefcase,
  GraduationCap,
} from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { uploadFile } from "@/lib/firebase/storage"
import { saveApplication } from "@/lib/firebase/firestore"
import { toast } from "@/hooks/use-toast"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
  dateOfBirth: z.date({
    required_error: "Please select your date of birth",
  }),
  position: z.string().min(1, "Please select a position"),
  employmentType: z.enum(["full-time", "part-time", "contract"], {
    required_error: "Please select employment type",
  }),
  salaryExpectation: z.string().min(1, "Please provide your salary expectation"),
  experience: z.string().min(10, "Please provide your relevant experience"),
  education: z.string().min(10, "Please provide your educational background"),
  skills: z.string().min(5, "Please list your relevant skills"),
  references: z.string().optional(),
  usId: z
    .any()
    .refine((file) => !file || file?.size <= MAX_FILE_SIZE, "File size must be less than 5MB")
    .refine(
      (file) => !file || ["image/jpeg", "image/png", "application/pdf"].includes(file?.type),
      "File must be JPEG, PNG, or PDF",
    ),
  cv: z
    .any()
    .refine((file) => !file || file?.size <= MAX_FILE_SIZE, "File size must be less than 5MB")
    .refine(
      (file) =>
        !file ||
        [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file?.type),
      "File must be PDF, DOC, or DOCX",
    ),

})

type FormValues = z.infer<typeof formSchema>

export default function JobApplicationForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [usIdPreview, setUsIdPreview] = useState<string | null>(null)
  const [cvName, setCvName] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      position: "",
      employmentType: "full-time",
      salaryExpectation: "",
      experience: "",
      education: "",
      skills: "",
      references: "",
    },
    mode: "onChange",
  })

  const watchAllFields = form.watch()

  const calculateProgress = () => {
    const totalFields = Object.keys(formSchema.shape).length
    const filledFields = Object.entries(watchAllFields).filter(([key, value]) => {
      if (key === "usId" || key === "cv") {
        return value !== undefined
      }
     
      return value !== "" && value !== undefined && value !== null
    }).length

    return Math.round((filledFields / totalFields) * 100)
  }

  const progress = calculateProgress()

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      // Upload files to Firebase Storage
      let usIdUrl = ""
      let cvUrl = ""

      if (values.usId) {
        usIdUrl = await uploadFile(values.usId, `ids/${values.email}-${Date.now()}-id`)
      }

      if (values.cv) {
        cvUrl = await uploadFile(values.cv, `cvs/${values.email}-${Date.now()}-cv`)
      }

      // Save application data to Firestore
      const applicationData = {
        ...values,
        usId: usIdUrl,
        cv: cvUrl,
        status: "new",
        createdAt: new Date().toISOString(),
      }

      await saveApplication(applicationData)

      toast({
        title: "Application Submitted Successfully",
        description: "Thank you for your application. We will be in touch shortly.",
      })

      form.reset()
      setUsIdPreview(null)
      setCvName(null)
      setStep(1)

      // Redirect to a thank you page
      router.push("/thanks-page")
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = async () => {
    let fieldsToValidate: (keyof FormValues)[] = []

    switch (step) {
      case 1:
        fieldsToValidate = ["firstName", "lastName", "email", "phone"]
        break
      case 2:
        fieldsToValidate = ["address", "city", "state", "zipCode"]
        break
      case 3:
        fieldsToValidate = ["position", "employmentType", "salaryExpectation"]
        break
      case 4:
        fieldsToValidate = ["experience", "education", "skills"]
        break
      case 5:
        fieldsToValidate = ["usId", "cv"]
        break
    }

    const isValid = await form.trigger(fieldsToValidate)

    if (isValid) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "usId" | "cv") => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue(fieldName, file)

      if (fieldName === "usId" && file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUsIdPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else if (fieldName === "cv") {
        setCvName(file.name)
      }
    }
  }

  const stepIcons = [
    <User key="user" className="h-5 w-5" />,
    <MapPin key="map" className="h-5 w-5" />,
    <Briefcase key="briefcase" className="h-5 w-5" />,
    <GraduationCap key="graduation" className="h-5 w-5" />,
    <FileText key="file" className="h-5 w-5" />,
  ]

  const stepTitles = [
    "Personal Information",
    "Address Details",
    "Position Information",
    "Experience & Skills",
    "Documents & Submission",
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 py-8 md:px-0">
      <Card className="border-gray-200 shadow-md overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <CardTitle className="text-2xl font-bold text-gray-800">Job Application Form</CardTitle>
          <CardDescription className="text-gray-600">Complete all sections to submit your application</CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Application Progress</span>
              <span className="text-sm font-medium text-gray-700">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div
                key={stepNumber}
                className={cn(
                  "flex flex-col items-center relative",
                  step === stepNumber ? "text-blue-600" : step > stepNumber ? "text-green-600" : "text-gray-400",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mb-2 border-2 transition-all",
                    step === stepNumber
                      ? "bg-blue-50 text-blue-600 border-blue-600"
                      : step > stepNumber
                        ? "bg-green-50 text-green-600 border-green-600"
                        : "bg-white text-gray-400 border-gray-300",
                  )}
                >
                  {step > stepNumber ? <CheckCircle2 className="h-5 w-5" /> : stepIcons[stepNumber - 1]}
                </div>
                <span className="text-xs font-medium hidden md:block text-center">{stepTitles[stepNumber - 1]}</span>
                {stepNumber < 5 && (
                  <div className="hidden md:block absolute top-5 left-[calc(100%_-_0.5rem)] w-[calc(100%_-_1rem)] h-[2px] bg-gray-200">
                    {step > stepNumber && <div className="h-full bg-green-600"></div>}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <User className="mr-2 h-5 w-5 text-blue-600" />
                      Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} className="border-gray-300 focus:border-blue-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} className="border-gray-300 focus:border-blue-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="john.doe@example.com"
                                {...field}
                                className="border-gray-300 focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="(123) 456-7890"
                                {...field}
                                className="border-gray-300 focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                      Address Information
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Street Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123 Main St"
                                {...field}
                                className="border-gray-300 focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">City</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="New York"
                                  {...field}
                                  className="border-gray-300 focus:border-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">State</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} className="border-gray-300 focus:border-blue-500" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">Zip Code</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="10001"
                                  {...field}
                                  className="border-gray-300 focus:border-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Briefcase className="mr-2 h-5 w-5 text-blue-600" />
                      Position Information
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Position Applied For</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-gray-300">
                                  <SelectValue placeholder="Select a position" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="software-engineer">Software Engineer</SelectItem>
                                <SelectItem value="senior-software-engineer">Senior Software Engineer</SelectItem>
                                <SelectItem value="product-manager">Product Manager</SelectItem>
                                <SelectItem value="ux-designer">UX Designer</SelectItem>
                                <SelectItem value="data-scientist">Data Scientist</SelectItem>
                                <SelectItem value="marketing-specialist">Marketing Specialist</SelectItem>
                                <SelectItem value="sales-representative">Sales Representative</SelectItem>
                                <SelectItem value="customer-support">Customer Support</SelectItem>
                                <SelectItem value="hr-specialist">HR Specialist</SelectItem>
                                <SelectItem value="finance-analyst">Finance Analyst</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employmentType"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-gray-700">Employment Type</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="full-time" />
                                  </FormControl>
                                  <FormLabel className="font-normal">Full-time</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="part-time" />
                                  </FormControl>
                                  <FormLabel className="font-normal">Part-time</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="contract" />
                                  </FormControl>
                                  <FormLabel className="font-normal">Contract</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="salaryExpectation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Salary Expectation (USD)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. 75,000"
                                {...field}
                                className="border-gray-300 focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                  
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5 text-blue-600" />
                      Experience & Qualifications
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Work Experience</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please list your relevant work experience, including company names, positions, and dates of employment."
                                className="min-h-[120px] border-gray-300 focus:border-blue-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Education</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please list your educational background, including institutions, degrees, and graduation dates."
                                className="min-h-[120px] border-gray-300 focus:border-blue-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Skills</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please list your relevant skills and competencies."
                                className="min-h-[120px] border-gray-300 focus:border-blue-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="references"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">References (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please provide professional references with their contact information (optional)."
                                className="min-h-[120px] border-gray-300 focus:border-blue-500"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              References are optional but may strengthen your application.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-blue-600" />
                      Required Documents
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="usId"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">US ID</FormLabel>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                              {usIdPreview ? (
                                <div className="space-y-3">
                                  <div className="relative w-full h-40 mx-auto overflow-hidden rounded-md">
                                    <img
                                      src={usIdPreview || "/placeholder.svg"}
                                      alt="ID Preview"
                                      className="object-contain w-full h-full"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setUsIdPreview(null)
                                      onChange(undefined)
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="flex justify-center">
                                    <Upload className="h-10 w-10 text-gray-400" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-700">Upload your US ID</p>
                                    <p className="text-xs text-gray-500">JPG, PNG, or PDF (max 5MB)</p>
                                  </div>
                                  <Button type="button" variant="outline" size="sm" className="relative">
                                    Select File
                                    <Input
                                      type="file"
                                      accept=".jpg,.jpeg,.png,.pdf"
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                      onChange={(e) => handleFileChange(e, "usId")}
                                      {...fieldProps}
                                    />
                                  </Button>
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cv"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">CV/Resume</FormLabel>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                              {cvName ? (
                                <div className="space-y-3">
                                  <div className="flex justify-center">
                                    <FileText className="h-10 w-10 text-gray-700" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700 break-all">{cvName}</p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setCvName(null)
                                      onChange(undefined)
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="flex justify-center">
                                    <Upload className="h-10 w-10 text-gray-400" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-700">Upload your CV/Resume</p>
                                    <p className="text-xs text-gray-500">PDF, DOC, or DOCX (max 5MB)</p>
                                  </div>
                                  <Button type="button" variant="outline" size="sm" className="relative">
                                    Select File
                                    <Input
                                      type="file"
                                      accept=".pdf,.doc,.docx"
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                      onChange={(e) => handleFileChange(e, "cv")}
                                      {...fieldProps}
                                    />
                                  </Button>
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                   
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-gray-200">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={handlePrevious} className="border-gray-300">
                    Previous
                  </Button>
                ) : (
                  <div></div>
                )}

                {step < 6 ? (
                  <Button
                    type={step === 5 ? "submit" : "button"}
                    onClick={step === 5 ? undefined : handleNext}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : step === 5 ? (
                      "Submit Application"
                    ) : (
                      "Next"
                    )}
                  </Button>
                ) : null}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <p>
          If you have any questions about the application process, please contact our HR department at{" "}
          <a href="mailto:hr@company.com" className="text-blue-600 hover:underline">
            hr@sza.com
          </a>
        </p>
      </div>
    </div>
  )
}
