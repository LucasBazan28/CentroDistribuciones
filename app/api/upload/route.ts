import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Note: For unsigned uploads, we don't need auth verification
    // Unsigned upload is delegated to Cloudinary with restrictions via upload preset
    // The upload preset "centro_distribuciones" must be configured in Cloudinary dashboard

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type on server side
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      )
    }

    // Create FormData for Cloudinary
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append("file", file)
    cloudinaryFormData.append("upload_preset", "centro_distribuciones")

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

    if (!cloudName) {
      console.error("Cloudinary cloud name not configured")
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    // Upload to Cloudinary
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    )

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json()
      console.error("Cloudinary error:", errorData)
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to upload image to Cloudinary" },
        { status: 500 }
      )
    }

    const cloudinaryData = await cloudinaryResponse.json()

    return NextResponse.json(
      {
        url: cloudinaryData.secure_url,
        public_id: cloudinaryData.public_id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
