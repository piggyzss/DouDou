import { NextRequest, NextResponse } from 'next/server'
import { ArtworkModel } from '@/lib/models/artwork'
import { deleteFile } from '@/lib/tencent-cos'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  try {
    const { collectionId } = params

    // 获取作品集信息
    const collection = await ArtworkModel.findById(parseInt(collectionId))
    if (!collection) {
      return NextResponse.json({ error: '作品集不存在' }, { status: 404 })
    }

    // 获取作品集的所有图片
    const images = await ArtworkModel.getImages(parseInt(collectionId))

    // 删除所有图片文件
    for (const image of images) {
      try {
        // 从完整URL中提取对象键
        const urlObj = new URL(image.file_url)
        const objectKey = urlObj.pathname.substring(1) // 移除开头的斜杠

        const deleteResult = await deleteFile(objectKey)
        if (!deleteResult) {
          console.warn('COS文件删除失败:', objectKey)
        }
      } catch (cosError) {
        console.error('删除COS文件失败:', cosError)
        // 继续删除其他文件
      }
    }

    // 删除作品集（这会级联删除所有相关的图片记录）
    const deleteResult = await ArtworkModel.delete(parseInt(collectionId))

    if (deleteResult) {
      return NextResponse.json({
        success: true,
        message: '作品集删除成功',
        deletedImages: images.length
      })
    } else {
      return NextResponse.json(
        { error: '作品集删除失败' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('删除作品集失败:', error)
    return NextResponse.json(
      { error: '删除作品集失败' },
      { status: 500 }
    )
  }
}
