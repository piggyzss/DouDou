import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, uploadMultipleFiles } from '@/lib/tencent-cos'

// 允许的文件类型
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
  'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac'
]

// 文件大小限制（10MB）
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`
      }, { status: 400 })
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 })
    }

    // 上传文件
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadFile(buffer, file.name, file.type, folder)

    if (result.success) {
      return NextResponse.json({
        success: true,
        url: result.url,
        filename: result.filename,
        fileSize: result.fileSize,
        width: result.width,
        height: result.height,
        duration: result.duration
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 批量上传接口
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folder = formData.get('folder') as string || 'uploads'

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // 验证所有文件
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({
          error: `File type not allowed: ${file.name}`
        }, { status: 400 })
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({
          error: `File too large: ${file.name}`
        }, { status: 400 })
      }
    }

    // 准备批量上传数据
    const uploadData = await Promise.all(
      files.map(async (file) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        originalname: file.name,
        mimetype: file.type
      }))
    )

    // 批量上传
    const results = await uploadMultipleFiles(uploadData, folder)

    // 检查上传结果
    const successResults = results.filter(r => r.success)
    const failedResults = results.filter(r => !r.success)

    return NextResponse.json({
      success: true,
      total: files.length,
      successful: successResults.length,
      failed: failedResults.length,
      results: successResults.map(r => ({
        url: r.url,
        filename: r.filename,
        fileSize: r.fileSize
      })),
      errors: failedResults.map(r => r.error)
    })

  } catch (error) {
    console.error('Batch upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
