"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UserFormProps {
  action: (formData: FormData) => Promise<any>
  defaultValues?: {
    name: string
    email: string
  }
  submitLabel?: string
}

export default function UserForm({
  action,
  defaultValues = { name: "", email: "" },
  submitLabel = "Thêm người dùng",
}: UserFormProps) {
  const [name, setName] = useState(defaultValues.name)
  const [email, setEmail] = useState(defaultValues.email)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)

      const result = await action(formData)

      if (result.success) {
        setSuccess("Thao tác thành công!")
        if (!defaultValues.name) {
          // Reset form if it's a create form
          setName("")
          setEmail("")
        }
      } else {
        setError(result.error || "Đã xảy ra lỗi")
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi xử lý yêu cầu")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="name">Tên</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên người dùng"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email"
          required
        />
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

      {success && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">{success}</div>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Đang xử lý..." : submitLabel}
      </Button>
    </form>
  )
}
