import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Lấy biến môi trường
    const dbUrl = process.env.DATABASE_URL || "không được thiết lập"

    // Kiểm tra định dạng cơ bản
    let isValidFormat = false
    let components = {
      protocol: null,
      credentials: null,
      host: null,
      port: null,
      database: null,
    }

    if (dbUrl && dbUrl.startsWith("postgres://")) {
      isValidFormat = true

      // Phân tích URL (không hiển thị mật khẩu đầy đủ)
      try {
        const url = new URL(dbUrl)
        components = {
          protocol: url.protocol,
          credentials: url.username ? "✓ Có" : "✗ Không",
          host: url.hostname,
          port: url.port || "5432 (mặc định)",
          database: url.pathname.substring(1), // Bỏ dấu / ở đầu
        }
      } catch (e) {
        isValidFormat = false
      }
    }

    // Kiểm tra các biến môi trường liên quan khác
    const otherVars = {
      POSTGRES_URL: process.env.POSTGRES_URL ? "✓ Đã thiết lập" : "✗ Không có",
      POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? "✓ Đã thiết lập" : "✗ Không có",
      POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? "✓ Đã thiết lập" : "✗ Không có",
      PGHOST: process.env.PGHOST ? "✓ Đã thiết lập" : "✗ Không có",
      PGDATABASE: process.env.PGDATABASE ? "✓ Đã thiết lập" : "✗ Không có",
      PGUSER: process.env.PGUSER ? "✓ Đã thiết lập" : "✗ Không có",
      PGPASSWORD: process.env.PGPASSWORD ? "✓ Đã thiết lập" : "✗ Không có",
    }

    return NextResponse.json({
      success: true,
      database_url: {
        exists: dbUrl !== "không được thiết lập",
        isValidFormat,
        components: isValidFormat ? components : null,
        maskedValue:
          dbUrl !== "không được thiết lập" ? `${dbUrl.substring(0, 15)}...${dbUrl.substring(dbUrl.length - 15)}` : null,
      },
      otherDatabaseVars: otherVars,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
