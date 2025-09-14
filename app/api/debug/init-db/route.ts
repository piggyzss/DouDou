import { NextRequest, NextResponse } from 'next/server'
import { initDatabase } from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Initializing database...')
    
    await initDatabase()
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    })
    
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        detail: error.detail,
        stack: error.stack
      }
    }, { status: 500 })
  }
}
