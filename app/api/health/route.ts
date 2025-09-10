import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 检查环境变量
    const envCheck = {
      database: !!process.env.DATABASE_URL,
      cos: {
        secretId: !!process.env.COS_SECRET_ID,
        secretKey: !!process.env.COS_SECRET_KEY,
        bucket: !!process.env.COS_BUCKET,
        region: !!process.env.COS_REGION,
        appId: !!process.env.COS_APP_ID,
        domain: !!process.env.COS_DOMAIN,
      },
      site: {
        url: !!process.env.NEXT_PUBLIC_SITE_URL,
        nodeEnv: process.env.NODE_ENV,
      }
    }

    // 检查数据库连接
    let dbStatus = 'unknown'
    if (process.env.DATABASE_URL) {
      try {
        const { Pool } = await import('pg')
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        })
        await pool.query('SELECT 1')
        await pool.end()
        dbStatus = 'connected'
      } catch (error) {
        dbStatus = 'error'
      }
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      envCheck,
      database: dbStatus,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
