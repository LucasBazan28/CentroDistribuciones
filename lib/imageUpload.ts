/**
 * Upload an image to Cloudinary using unsigned upload
 * @param file - Image file to upload
 * @returns Promise resolving to the Cloudinary image URL
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!cloudName) {
    throw new Error("Cloudinary cloud name is not configured")
  }

  // Validate file
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file")
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image size must be less than 5MB")
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", "centro_distribuciones")

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || "Failed to upload image")
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to upload image to Cloudinary")
  }
}

/**
 * Validate image file before upload
 * @param file - File to validate
 * @returns Error message or null if valid
 */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please select a valid image file (JPG, PNG, GIF, etc.)"
  }

  const sizeInMB = file.size / (1024 * 1024)
  if (sizeInMB > 5) {
    return `Image size (${sizeInMB.toFixed(2)}MB) exceeds the maximum of 5MB`
  }

  return null
}
