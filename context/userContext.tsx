"use client"

import { User } from "@/types"
import { createContext, useContext, useState, type ReactNode, useEffect } from "react"


type UserContextType = {
  user: User | null
  hasPermission: (action: "create" | "edit" | "delete") => boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({
  children,
  initialUser,
}: {
  children: ReactNode
  initialUser: User | null// Recibe el usuario desde la sesión del servidor
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser)

  useEffect(() => {
    setCurrentUser(initialUser)
  }, [initialUser])

  const hasPermission = (action: "create" | "edit" | "delete"): boolean => {
    if (!currentUser) return false
    const { role } = currentUser

    switch (action) {
      case "create":
        return ["USER", "ADMIN"].includes(role)
      case "edit":
        return ["USER", "ADMIN"].includes(role)
      case "delete":
        return role === "ADMIN"
      default:
        return false
    }
  }


  return (
    <UserContext.Provider value={{ user: currentUser, hasPermission }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return context
}