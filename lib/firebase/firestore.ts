import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./config"

// Save a new job application
export async function saveApplication(applicationData: any) {
  try {
    const docRef = await addDoc(collection(db, "applications"), {
      ...applicationData,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error saving application:", error)
    throw error
  }
}

// Get all job applications
export async function getAllApplications() {
  try {
    const q = query(collection(db, "applications"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting applications:", error)
    throw error
  }
}

// Get a specific application by ID
export async function getApplicationById(id: string) {
  try {
    const docRef = doc(db, "applications", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting application:", error)
    throw error
  }
}

// Update application status
export async function updateApplicationStatus(id: string, status: string) {
  try {
    const docRef = doc(db, "applications", id)
    await updateDoc(docRef, {
      status: status,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error updating application status:", error)
    throw error
  }
}

// Get user by email (for authentication)
export async function getUserByEmail(email: string) {
  try {
    const q = query(collection(db, "users"), where("email", "==", email))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]
      return {
        id: userDoc.id,
        ...userDoc.data(),
      }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting user:", error)
    throw error
  }
}
