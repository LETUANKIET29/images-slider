import { NextResponse } from "next/server"

export async function GET() {
  console.log("🚀 Starting Neon database test...")

  try {
    // Check environment variables first
    const dbUrl = process.env.DATABASE_URL

    console.log("🔍 Environment check:")
    console.log("- DATABASE_URL:", dbUrl ? "✅ Set" : "❌ Missing")

    if (!dbUrl) {
      console.error("❌ DATABASE_URL environment variable is missing")
      return NextResponse.json(
        {
          success: false,
          error: "Missing DATABASE_URL environment variable",
          details: {
            DATABASE_URL: "Missing",
            solution: "Add DATABASE_URL to your environment variables",
            format: "postgres://username:password@hostname:port/database",
          },
        },
        { status: 500 },
      )
    }

    // Dynamically import the database functions to catch import errors
    console.log("📦 Importing database functions...")
    let testConnection, initializeDatabase

    try {
      const dbModule = await import("@/lib/db")
      testConnection = dbModule.testConnection
      initializeDatabase = dbModule.initializeDatabase
      console.log("✅ Database functions imported successfully")
    } catch (importError) {
      console.error("❌ Failed to import database functions:", importError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to import database functions",
          details: {
            message: importError instanceof Error ? importError.message : "Unknown import error",
            stack: importError instanceof Error ? importError.stack : undefined,
            troubleshooting: {
              checkPackage: "Verify @neondatabase/serverless is installed",
              checkImports: "Check if all imports are correct",
              checkSyntax: "Verify TypeScript/JavaScript syntax",
            },
          },
        },
        { status: 500 },
      )
    }

    // Test connection
    console.log("🔗 Testing Neon database connection...")
    const connectionTest = await testConnection()

    if (!connectionTest.success) {
      console.error("❌ Connection test failed:", connectionTest.error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to connect to Neon database",
          details: connectionTest,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    console.log("✅ Connection test passed")

    // Initialize database
    console.log("🏗️ Initializing database schema...")
    const initResult = await initializeDatabase()

    if (!initResult.success) {
      console.error("❌ Database initialization failed:", initResult.error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to initialize database",
          details: initResult,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    console.log("✅ Database initialization successful")
    console.log("🎉 All tests passed successfully!")

    return NextResponse.json({
      success: true,
      message: "Neon database connection and initialization successful",
      connectionTest,
      initResult,
      timestamp: new Date().toISOString(),
      database: "Neon PostgreSQL",
      environment: {
        DATABASE_URL: "✅ Configured",
        nodeVersion: process.version,
        platform: process.platform,
      },
    })
  } catch (error) {
    console.error("💥 Unexpected error in Neon test endpoint:", error)

    // Detailed error analysis
    const errorAnalysis = {
      type: typeof error,
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      stack: error instanceof Error ? error.stack?.split("\n").slice(0, 10) : undefined,
    }

    // Common error patterns and solutions
    const troubleshooting: any = {
      general: "Check server logs for more details",
    }

    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        troubleshooting.network = "Check network connectivity to Neon database"
      }
      if (error.message.includes("auth")) {
        troubleshooting.authentication = "Verify database credentials in DATABASE_URL"
      }
      if (error.message.includes("timeout")) {
        troubleshooting.timeout = "Database connection timeout - check network or database status"
      }
      if (error.message.includes("syntax")) {
        troubleshooting.syntax = "SQL syntax error - check query formatting"
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error occurred during database test",
        details: errorAnalysis,
        troubleshooting,
        timestamp: new Date().toISOString(),
        helpfulLinks: {
          neonDocs: "https://neon.tech/docs",
          troubleshooting: "https://neon.tech/docs/troubleshooting",
        },
      },
      { status: 500 },
    )
  }
}
