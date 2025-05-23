import { type NextRequest, NextResponse } from "next/server"
import { getAllUsers, addUser } from "@/lib/db"

export async function GET() {
  try {
    console.log("Getting all users...")
    const result = await getAllUsers()

    if (!result.success) {
      console.error("Failed to get users:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to get users",
          details: result.details,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0,
    })
  } catch (error) {
    console.error("Unexpected error in GET /api/users:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email } = body

    console.log("Adding new user:", { name, email })

    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and email are required",
        },
        { status: 400 },
      )
    }

    const result = await addUser(name, email)

    if (!result.success) {
      console.error("Failed to add user:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to add user",
          details: result.details,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: "User created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Unexpected error in POST /api/users:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
