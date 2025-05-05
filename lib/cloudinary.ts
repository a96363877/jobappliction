/**
 * Utility functions for Cloudinary uploads
 */

// Function to upload a file to Cloudinary
export async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  try {
    // Create a FormData instance to send the file
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "job_applications") // Your upload preset name in Cloudinary
    formData.append("folder", folder)

    // Make the upload request to Cloudinary using the environment variable
    const cloudName = "dwfhgdxzl"
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload file to Cloudinary")
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    throw error
  }
}

// Function to save application data to your database
export async function saveApplication(applicationData: any): Promise<void> {
  try {
    // This is a placeholder for your database save logic
    // You would typically make an API call to your backend here
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(applicationData),
    })

    if (!response.ok) {
      throw new Error("Failed to save application data")
    }
  } catch (error) {
    console.error("Error saving application:", error)
    throw error
  }
}
