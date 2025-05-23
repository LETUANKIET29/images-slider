import { type NextRequest, NextResponse } from "next/server"
import { getUserById, updateUser, deleteUser } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })
    }

    const result = await getUserById(id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error)
    return NextResponse.json({ error: "Đã xảy ra lỗi khi lấy thông tin user" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })
    }

    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name và email là bắt buộc" }, { status: 400 })
    }

    const result = await updateUser(id, name, email)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error("Lỗi khi cập nhật user:", error)
    return NextResponse.json({ error: "Đã xảy ra lỗi khi cập nhật user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 })
    }

    const result = await deleteUser(id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ message: "User đã được xóa thành công" })
  } catch (error) {
    console.error("Lỗi khi xóa user:", error)
    return NextResponse.json({ error: "Đã xảy ra lỗi khi xóa user" }, { status: 500 })
  }
}
