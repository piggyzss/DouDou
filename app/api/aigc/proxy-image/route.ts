import { NextRequest, NextResponse } from 'next/server'
import COS from 'cos-nodejs-sdk-v5'
import { cosConfig } from '@/lib/tencent-cos-config'

// 创建COS实例
const cos = new COS({
  SecretId: cosConfig.SecretId,
  SecretKey: cosConfig.SecretKey,
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json({ error: '请提供图片URL' }, { status: 400 })
    }

    // 从完整URL中提取对象键
    const urlObj = new URL(url)
    const objectKey = urlObj.pathname.substring(1) // 移除开头的斜杠
    
    // 从COS获取图片
    const result = await cos.getObject({
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      Key: objectKey,
    })
    
    if (result.statusCode === 200 && result.Body) {
      // 统一转换为 Uint8Array
      const body: any = result.Body as any
      let bytes: Uint8Array

      if (Buffer.isBuffer(body)) {
        bytes = new Uint8Array(body)
      } else if (typeof body === 'string') {
        bytes = new TextEncoder().encode(body)
      } else if (body && typeof body.byteLength === 'number' && typeof body.slice === 'function' && !body.buffer) {
        // 纯 ArrayBuffer
        bytes = new Uint8Array(body as ArrayBuffer)
      } else if (body && body.buffer && typeof body.byteLength === 'number') {
        // TypedArray 视图
        bytes = new Uint8Array(body.buffer, body.byteOffset || 0, body.byteLength)
      } else {
        // 兜底转换
        bytes = new Uint8Array(body as ArrayLike<number>)
      }

      // 拷贝到全新的 ArrayBuffer，确保类型为 ArrayBuffer 而非 SharedArrayBuffer
      const arrayBuffer = new ArrayBuffer(bytes.byteLength)
      new Uint8Array(arrayBuffer).set(bytes)

      const contentType = (result.headers?.['content-type'] as string) || 'image/jpeg'
      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600', // 1小时缓存
          'Access-Control-Allow-Origin': '*',
        },
      })
    } else {
      return NextResponse.json(
        { error: '图片获取失败' }, 
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('代理图片失败:', error)
    return NextResponse.json(
      { error: '图片代理失败' }, 
      { status: 500 }
    )
  }
}
