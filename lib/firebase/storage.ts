import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "./config"

// Upload a file to Firebase Storage
export async function uploadFile(file: File, path: string) {
  try {
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}
