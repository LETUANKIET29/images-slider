import { type NextRequest, NextResponse } from "next/server"
import { searchUsers } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: "Search query is required",
        },
        { status: 400 },
      )
    }

    console.log("Searching users with query:", query)
    const result = await searchUsers(query)

    if (!result.success) {
      console.error("Failed to search users:", result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to search users",
          details: result.details,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0,
      query,
    })
  } catch (error) {
    console.error("Unexpected error in search users:", error)
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
