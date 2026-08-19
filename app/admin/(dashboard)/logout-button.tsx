"use client"

import axios from "axios"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export function LogoutButton() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function handleLogout() {
    setIsPending(true)

    try {
      await axios.post("/api/auth/logout")
    } finally {
      router.push("/admin/login")
      router.refresh()
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={isPending}>
      {isPending ? <Spinner data-icon="inline-start" /> : <LogOut data-icon="inline-start" />}
      {isPending ? "Signing out…" : "Sign out"}
    </Button>
  )
}
