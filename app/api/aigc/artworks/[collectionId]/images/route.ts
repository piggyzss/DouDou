import { NextRequest, NextResponse } from 'next/server'
import { ArtworkModel } from '../../../../../../lib/models/artwork'
import { uploadFile } from '../../../../../../lib/tencent-cos'

export async function POST(
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  try {
    const { collectionId } = params
    const contentType = req.headers.get('content-type') || ''
    let urls: string[] = []
    let filesCount = 0

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const files = formData.getAll('files') as File[]
      if (!files || files.length === 0) {
        return NextResponse.json({ error: '未提供图片文件' }, { status: 400 })
      }
      // 上传到 COS
      const uploaded: string[] = []
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const res = await uploadFile(buffer, file.name, file.type, 'aigc/images')
        if (!res.success || !res.url) {
          return NextResponse.json({ error: res.error || '图片上传失败' }, { status: 500 })
        }
        uploaded.push(res.url)
      }
      urls = uploaded
      filesCount = files.length
    } else {
      const body = await req.json().catch(() => ({}))
      urls = Array.isArray(body.urls) ? body.urls : []
      if (urls.length === 0) {
        return NextResponse.json({ error: '请提供有效的图片URL' }, { status: 400 })
      }
    }
    
    // 验证作品集是否存在
    const collection = await ArtworkModel.findById(parseInt(collectionId))
    if (!collection) {
      return NextResponse.json({ error: '作品集不存在' }, { status: 404 })
    }
    
    // 获取当前图片数量，用于设置sort_order
    const existingImages = await ArtworkModel.getImages(parseInt(collectionId))
    const startSortOrder = existingImages.length
    
    // 添加图片到数据库
    const addedImages = [] as any[]
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      
      // 从URL中提取文件名
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const filename = pathParts[pathParts.length - 1]
      
      // 添加图片记录
      const image = await ArtworkModel.addImage(parseInt(collectionId), {
        filename: filename,
        original_name: filename,
        file_url: url,
        file_size: 0, // 暂时设为0，后续可以从COS获取
        mime_type: 'image/jpeg', // 暂时设为image/jpeg，后续可以从文件扩展名判断
        sort_order: startSortOrder + i
      })
      
      addedImages.push(image)
    }
    
    return NextResponse.json({
      success: true,
      message: '图片添加成功',
      uploadedFiles: urls,
      addedImages: addedImages.length,
      images: addedImages,
      filesReceived: filesCount
    })
    
  } catch (error) {
    console.error('添加图片失败:', error)
    return NextResponse.json(
      { error: '添加图片失败' }, 
      { status: 500 }
    )
  }
}
