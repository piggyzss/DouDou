import { NextRequest, NextResponse } from 'next/server'
import { ArtworkModel } from '@/lib/models/artwork'
import { uploadFile } from '@/lib/tencent-cos'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const tags = formData.get('tags') as string
    const files = formData.getAll('files') as File[]

    if (!title) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 })
    }

    // 解析标签
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : []

    // 处理文件上传
    const uploadedFiles: string[] = []
    let coverImageUrl: string | undefined

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const buffer = Buffer.from(await file.arrayBuffer())
        const result = await uploadFile(
          buffer,
          file.name,
          file.type,
          'aigc/images'
        )

        if (result.success && result.url) {
          uploadedFiles.push(result.url)
          // 第一张图片作为封面
          if (i === 0) {
            coverImageUrl = result.url
          }
        }
      }
    }

    // 创建作品集
    const collection = await ArtworkModel.create({
      title,
      description,
      tags: tagArray,
      cover_image_url: coverImageUrl
    })

    // 将上传的图片保存到数据库
    if (uploadedFiles.length > 0) {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = files[i]
        await ArtworkModel.addImage(collection.id, {
          filename: `${Date.now()}-${i}-${file.name}`,
          original_name: file.name,
          file_url: uploadedFiles[i],
          file_size: file.size,
          mime_type: file.type,
          sort_order: i
        })
      }
    }

    return NextResponse.json({
      success: true,
      collection,
      uploadedFiles
    })

  } catch (error) {
    console.error('Create artwork error:', error)
    return NextResponse.json(
      { error: '创建作品集失败' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const result = await ArtworkModel.findAll(page, limit)

    // 获取每个作品集的图片
    const collectionsWithImages = await Promise.all(
      result.collections.map(async (collection) => {
        const images = await ArtworkModel.getImages(collection.id)
        return {
          ...collection,
          images: images // 返回完整的图片对象数组
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        collections: collectionsWithImages
      }
    })

  } catch (error) {
    console.error('Get artworks error:', error)
    return NextResponse.json(
      { error: '获取作品集列表失败' },
      { status: 500 }
    )
  }
}
