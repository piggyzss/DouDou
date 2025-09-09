import COS from 'cos-nodejs-sdk-v5'
import { v4 as uuidv4 } from 'uuid'
import { cosConfig, validateCosConfig, MIME_TYPE_MAP, MEDIA_TYPE_MAP, UploadResult } from './tencent-cos-config'

// 创建COS实例
const cos = new COS({
  SecretId: cosConfig.SecretId,
  SecretKey: cosConfig.SecretKey,
})

/**
 * 上传文件到腾讯云COS
 */
export async function uploadFile(
  file: Buffer | string,
  originalName: string,
  mimeType: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    // 验证配置
    validateCosConfig()
    
    // 生成唯一文件名
    const fileExtension = MIME_TYPE_MAP[mimeType as keyof typeof MIME_TYPE_MAP] || 'bin'
    const filename = `${folder}/${Date.now()}-${uuidv4()}.${fileExtension}`
    
    // 上传参数
    const uploadParams: any = {
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      Key: filename,
      Body: file,
      ContentType: mimeType,
      ContentDisposition: `inline; filename="${originalName}"`,
      CacheControl: 'max-age=31536000', // 1年缓存
    }

    // 执行上传
    const result = await cos.putObject(uploadParams)
    
    if (result.statusCode === 200) {
      const fileUrl = `${cosConfig.Domain}/${filename}`
      
      // 获取文件信息
      const fileSize = Buffer.isBuffer(file) ? file.length : Buffer.byteLength(file, 'utf8')
      
      // 如果是图片，获取尺寸信息
      let mediaInfo: { width?: number; height?: number; duration?: number } = {}
      if (MEDIA_TYPE_MAP[mimeType as keyof typeof MEDIA_TYPE_MAP] === 'image') {
        mediaInfo = await getImageInfo(file)
      }
      
      return {
        success: true,
        url: fileUrl,
        filename,
        fileSize,
        width: mediaInfo.width,
        height: mediaInfo.height,
        duration: mediaInfo.duration
      }
    } else {
      return {
        success: false,
        error: `Upload failed with status: ${result.statusCode}`
      }
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    }
  }
}

/**
 * 删除文件
 */
export async function deleteFile(filename: string): Promise<boolean> {
  try {
    validateCosConfig()
    
    const result = await cos.deleteObject({
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      Key: filename
    })
    
    return result.statusCode === 200
  } catch (error) {
    console.error('Delete file error:', error)
    return false
  }
}

/**
 * 获取图片信息
 */
async function getImageInfo(file: Buffer | string): Promise<{ width?: number; height?: number; duration?: number }> {
  try {
    // 这里可以使用 sharp 或其他图片处理库获取图片尺寸
    // 为了简化，这里返回空对象
    // 实际项目中建议使用 sharp 库
    return {}
  } catch (error) {
    console.error('Get image info error:', error)
    return {}
  }
}

/**
 * 生成缩略图
 */
export async function generateThumbnail(
  originalUrl: string,
  width: number = 300,
  height: number = 300
): Promise<string> {
  try {
    // 这里可以使用腾讯云的图片处理服务
    // 格式：原图URL?imageView2/1/w/300/h/300
    return `${originalUrl}?imageView2/1/w/${width}/h/${height}`
  } catch (error) {
    console.error('Generate thumbnail error:', error)
    return originalUrl
  }
}

/**
 * 批量上传文件
 */
export async function uploadMultipleFiles(
  files: Array<{ buffer: Buffer; originalname: string; mimetype: string }>,
  folder: string = 'uploads'
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => 
    uploadFile(file.buffer, file.originalname, file.mimetype, folder)
  )
  
  return Promise.all(uploadPromises)
}

/**
 * 获取文件访问URL
 */
export function getFileUrl(filename: string): string {
  return `${cosConfig.Domain}/${filename}`
}

/**
 * 检查文件是否存在
 */
export async function fileExists(filename: string): Promise<boolean> {
  try {
    validateCosConfig()
    
    const result = await cos.headObject({
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      Key: filename
    })
    
    return result.statusCode === 200
  } catch (error) {
    return false
  }
}

/**
 * 获取存储桶文件列表
 */
export async function listFiles(prefix: string = '', maxKeys: number = 100) {
  try {
    validateCosConfig()
    
    const result = await cos.getBucket({
      Bucket: cosConfig.Bucket,
      Region: cosConfig.Region,
      Prefix: prefix,
      MaxKeys: maxKeys
    })
    
    return result.Contents || []
  } catch (error) {
    console.error('List files error:', error)
    return []
  }
}
