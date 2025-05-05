import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary with your credentials
// Note: In a production environment, these should be stored as environment variables
cloudinary.config({
  cloud_name: "dwfhgdxzl",
  api_key:"136542963838448",
  api_secret: "7EbLErrbm9qrW87YcdkC4bk-LhA",
  secure: true,
})

export async function POST(request: Request) {
  try {
    const { folder } = await request.json()

    // Generate a timestamp and signature for secure uploads
    const timestamp = Math.round(new Date().getTime() / 1000)
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      "7EbLErrbm9qrW87YcdkC4bk-LhA" || "",
    )

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: "dwfhgdxzl",
      apiKey: "136542963838448",
    })
  } catch (error) {
    console.error("Error generating signature:", error)
    return NextResponse.json({ error: "Failed to generate signature" }, { status: 500 })
  }
}
