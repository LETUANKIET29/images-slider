import { NextResponse } from 'next/server';
import { db, testConnection } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test basic connection
    const result = await testConnection();
    
    // Test database version
    console.log('🔄 Getting database version...');
    const versionResult = await db.execute('SELECT sqlite_version() as version');
    console.log('✅ Database version:', versionResult.rows[0]);
    
    // Test database tables
    console.log('🔄 Getting database tables...');
    const tablesResult = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('✅ Database tables:', tablesResult.rows);
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connection successful',
      data: {
        connection: result,
        version: versionResult.rows[0],
        tables: tablesResult.rows
      }
    });
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Database connection failed', 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 