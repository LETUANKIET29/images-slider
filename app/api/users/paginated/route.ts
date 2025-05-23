import { type NextRequest, NextResponse } from "next/server"
import { getUsersWithPagination } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid pagination parameters",
        },
        { status: 400 },
      )
    }

    console.log("Getting paginated users:", { page, limit })
    const result = await getUsersWithPagination(page, limit)

    if (!result.success) {
      console.error("Failed to get paginated users:", result.error)
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
      pagination: result.pagination,
    })
  } catch (error) {
    console.error("Unexpected error in paginated users:", error)
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
