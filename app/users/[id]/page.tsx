import { getUserById } from "@/lib/db"
import { updateUserAction } from "@/app/actions"
import Link from "next/link"
import UserForm from "../user-form"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"
import DeleteButton from "./delete-button"

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    notFound()
  }

  const result = await getUserById(id)

  if (!result.success) {
    notFound()
  }

  const user = result.data

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chi tiết người dùng</h1>
        <Link href="/users">
          <Button variant="outline">Quay lại danh sách</Button>
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin người dùng</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">ID</p>
            <p className="font-medium">{user.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Ngày tạo</p>
            <p className="font-medium">{new Date(user.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Cập nhật thông tin</h2>
        <UserForm
          action={(formData) => updateUserAction(id, formData)}
          defaultValues={{
            name: user.name,
            email: user.email,
          }}
          submitLabel="Cập nhật"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Vùng nguy hiểm</h2>
        <p className="mb-4 text-gray-600">
          Xóa người dùng này sẽ xóa vĩnh viễn tất cả dữ liệu liên quan. Hành động này không thể hoàn tác.
        </p>
        <DeleteButton userId={id} />
      </div>
    </div>
  )
}
