"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { deleteUserAction } from "@/app/actions"

export default function DeleteButton({ userId }: { userId: number }) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteUserAction(userId)

      if (result.success) {
        router.push("/users")
      } else {
        setError(result.error || "Đã xảy ra lỗi khi xóa")
        setIsConfirming(false)
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi xử lý yêu cầu")
      setIsConfirming(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isConfirming) {
    return (
      <div>
        <p className="mb-4 font-medium text-red-600">Bạn có chắc chắn muốn xóa người dùng này?</p>
        <div className="flex space-x-3">
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
          </Button>
          <Button variant="outline" onClick={() => setIsConfirming(false)} disabled={isDeleting}>
            Hủy
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">{error}</div>}
      <Button variant="destructive" onClick={() => setIsConfirming(true)}>
        Xóa người dùng
      </Button>
    </div>
  )
}
