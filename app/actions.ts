"use server"

import { revalidatePath } from "next/cache"
import { addUser, updateUser, deleteUser } from "@/lib/db"

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string

  if (!name || !email) {
    return {
      success: false,
      error: "Name và email là bắt buộc",
    }
  }

  const result = await addUser(name, email)

  if (result.success) {
    revalidatePath("/users")
  }

  return result
}

export async function updateUserAction(id: number, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string

  if (!name || !email) {
    return {
      success: false,
      error: "Name và email là bắt buộc",
    }
  }

  const result = await updateUser(id, name, email)

  if (result.success) {
    revalidatePath("/users")
    revalidatePath(`/users/${id}`)
  }

  return result
}

export async function deleteUserAction(id: number) {
  const result = await deleteUser(id)

  if (result.success) {
    revalidatePath("/users")
  }

  return result
}
