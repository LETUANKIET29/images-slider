import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    console.log("Thử kết nối đơn giản đến Neon...")

    // Lấy DATABASE_URL
    const dbUrl = process.env.DATABASE_URL

    if (!dbUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "DATABASE_URL không được thiết lập",
        },
        { status: 500 },
      )
    }

    // Tạo kết nối và thực hiện truy vấn đơn giản
    const sql = neon(dbUrl)
    const result = await sql`SELECT 1 as test`

    return NextResponse.json({
      success: true,
      message: "Kết nối thành công!",
      result: result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        errorType: typeof error,
        errorDetails:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : null,
      },
      { status: 500 },
    )
  }
}
