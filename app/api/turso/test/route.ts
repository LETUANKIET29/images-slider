import { NextResponse } from "next/server"
import { testConnection, initializeDatabase } from "@/lib/db"

export async function GET() {
  try {
    console.log("Testing Turso connection...")

    // Check environment variables
    const dbUrl = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN

    console.log("Environment check:")
    console.log("- TURSO_DATABASE_URL:", dbUrl ? "✓ Set" : "✗ Missing")
    console.log("- TURSO_AUTH_TOKEN:", authToken ? "✓ Set" : "✗ Missing")

    if (!dbUrl || !authToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing environment variables",
          details: {
            TURSO_DATABASE_URL: dbUrl ? "Set" : "Missing",
            TURSO_AUTH_TOKEN: authToken ? "Set" : "Missing",
          },
        },
        { status: 500 },
      )
    }

    // Test connection
    console.log("Testing database connection...")
    const connectionTest = await testConnection()

    if (!connectionTest.success) {
      console.error("Connection test failed:", connectionTest.error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to connect to Turso database",
          details: connectionTest,
        },
        { status: 500 },
      )
    }

    // Initialize database
    console.log("Initializing database schema...")
    const initResult = await initializeDatabase()

    if (!initResult.success) {
      console.error("Database initialization failed:", initResult.error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to initialize database",
          details: initResult,
        },
        { status: 500 },
      )
    }

    console.log("All tests passed successfully!")

    return NextResponse.json({
      success: true,
      message: "Turso database connection and initialization successful",
      connectionTest,
      initResult,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Unexpected error in test endpoint:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error occurred",
        details: {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          type: typeof error,
          error: error,
        },
      },
      { status: 500 },
    )
  }
}
