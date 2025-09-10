import { NextRequest, NextResponse } from 'next/server'
import COS from 'cos-nodejs-sdk-v5'
import { cosConfig } from '../../../../lib/tencent-cos-config'

const cos = new COS({ SecretId: cosConfig.SecretId, SecretKey: cosConfig.SecretKey })

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')
    if (!url) return NextResponse.json({ error: 'missing url' }, { status: 400 })

    const { hostname, pathname } = new URL(url)
    const isCosHost = hostname.includes('.cos.') && hostname.endsWith('.myqcloud.com')
    if (!isCosHost) {
      const range = req.headers.get('range') || undefined
      const res = await fetch(url, { headers: range ? { range } as any : undefined })
      if (!res.ok || !res.body) return NextResponse.json({ error: 'fetch failed' }, { status: 502 })
      const headers = new Headers()
      headers.set('content-type', res.headers.get('content-type') || 'audio/mpeg')
      const acceptRanges = res.headers.get('accept-ranges')
      if (acceptRanges) headers.set('accept-ranges', acceptRanges)
      const contentRange = res.headers.get('content-range')
      if (contentRange) headers.set('content-range', contentRange)
      return new NextResponse(res.body as any, { status: res.status, headers })
    }

    const key = pathname.startsWith('/') ? pathname.slice(1) : pathname
    const range = req.headers.get('range') || undefined
    const result = await cos.getObject({
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      Key: key,
      Range: range as any
    })
    if (!result || (result.statusCode !== 200 && result.statusCode !== 206) || !result.Body) {
      return NextResponse.json({ error: 'cos fetch failed' }, { status: 502 })
    }

    const body = result.Body as Buffer | string | ArrayBuffer | Uint8Array
    let arrayBuffer: ArrayBuffer
    if (Buffer.isBuffer(body)) arrayBuffer = body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer
    else if (typeof body === 'string') arrayBuffer = new TextEncoder().encode(body).buffer
    else if (body instanceof ArrayBuffer) arrayBuffer = body
    else if (body instanceof Uint8Array) arrayBuffer = body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer
    else arrayBuffer = new TextEncoder().encode(String(body)).buffer

    const headers: Record<string, string> = {
      'content-type': (result.headers?.['content-type'] as string) || 'audio/mpeg',
      'accept-ranges': 'bytes',
      'cache-control': 'public, max-age=300'
    }
    const contentRange = result.headers?.['content-range'] as string | undefined
    if (contentRange) headers['content-range'] = contentRange

    return new NextResponse(arrayBuffer, { status: result.statusCode, headers })
  } catch (e) {
    console.error('proxy-audio error:', e)
    return NextResponse.json({ error: 'proxy error' }, { status: 500 })
  }
}


