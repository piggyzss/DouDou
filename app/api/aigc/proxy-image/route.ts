import { NextRequest, NextResponse } from 'next/server'
import COS from 'cos-nodejs-sdk-v5'
import { cosConfig } from '../../../../lib/tencent-cos-config'

export const dynamic = 'force-dynamic'

const cos = new COS({ SecretId: cosConfig.SecretId, SecretKey: cosConfig.SecretKey })

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')
    if (!url) return NextResponse.json({ error: 'missing url' }, { status: 400 })

    const { hostname, pathname } = new URL(url)
    const isCosHost = hostname.includes('.cos.') && hostname.endsWith('.myqcloud.com')
    if (!isCosHost) {
      // 对非 COS 域名，回退为普通透传
      const res = await fetch(url)
      if (!res.ok || !res.body) return NextResponse.json({ error: 'fetch failed' }, { status: 502 })
      const headers = new Headers()
      headers.set('content-type', res.headers.get('content-type') || 'image/jpeg')
      headers.set('cache-control', res.headers.get('cache-control') || 'public, max-age=300')
      return new NextResponse(res.body as any, { status: res.status, headers })
    }

    const key = pathname.startsWith('/') ? pathname.slice(1) : pathname
    const result = await cos.getObject({ Bucket: cosConfig.Bucket, Region: cosConfig.Region, Key: key })
    if (result.statusCode !== 200 || !result.Body) return NextResponse.json({ error: 'cos fetch failed' }, { status: 502 })

    const body = result.Body as Buffer | string | ArrayBuffer | Uint8Array
    let arrayBuffer: ArrayBuffer
    if (Buffer.isBuffer(body)) arrayBuffer = body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer
    else if (typeof body === 'string') arrayBuffer = new TextEncoder().encode(body).buffer
    else if (body instanceof ArrayBuffer) arrayBuffer = body
    else if (body instanceof Uint8Array) arrayBuffer = body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer
    else arrayBuffer = new TextEncoder().encode(String(body)).buffer

    const contentType = (result.headers?.['content-type'] as string) || 'image/jpeg'
    return new NextResponse(arrayBuffer, { headers: { 'content-type': contentType, 'cache-control': 'public, max-age=900' } })
  } catch (e) {
    console.error('proxy-image error:', e)
    return NextResponse.json({ error: 'proxy error' }, { status: 500 })
  }
}

// 仅保留简单透传代理，避免重复导出与环境依赖
