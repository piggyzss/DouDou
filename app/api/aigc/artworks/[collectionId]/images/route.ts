import { NextRequest, NextResponse } from 'next/server'
import { ArtworkModel } from '@/lib/models/artwork'

export async function POST(
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  try {
    const { collectionId } = params
    const { urls } = await req.json()
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: '请提供有效的图片URL' }, { status: 400 })
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
    const addedImages = []
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
      addedImages: addedImages.length,
      images: addedImages
    })
    
  } catch (error) {
    console.error('添加图片失败:', error)
    return NextResponse.json(
      { error: '添加图片失败' }, 
      { status: 500 }
    )
  }
}
