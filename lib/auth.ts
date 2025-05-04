import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { signInWithEmailAndPassword } from "firebase/auth"

import { auth } from "@/lib/firebase/config"
import { getUserByEmail } from "@/lib/firebase/firestore"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Authenticate with Firebase
          const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password)

          const firebaseUser = userCredential.user

          // Get additional user data from Firestore
          const userData = await getUserByEmail(credentials.email)

          // Only allow admin users to login
          if (userData?.role !== "admin") {
            throw new Error("Access denied. Admin privileges required.")
          }

          return {
            id: firebaseUser.uid,
            name: userData?.name || firebaseUser.displayName,
            email: firebaseUser.email,
            role: userData?.role,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}
