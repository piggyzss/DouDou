export const cosConfig = {
  SecretId: process.env.COS_SECRET_ID!,
  SecretKey: process.env.COS_SECRET_KEY!,
  Bucket: process.env.COS_BUCKET!,
  Region: process.env.COS_REGION || "ap-beijing",
  AppId: process.env.COS_APP_ID!,
  Domain:
    process.env.COS_DOMAIN ||
    `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION || "ap-beijing"}.myqcloud.com`,
};

// 验证配置
export function validateCosConfig() {
  const required = ["SecretId", "SecretKey", "Bucket", "AppId"];
  for (const key of required) {
    if (!cosConfig[key as keyof typeof cosConfig]) {
      throw new Error(`Missing required COS config: ${key}`);
    }
  }
  console.log("✅ COS configuration validated successfully");
}

// 文件类型映射
export const MIME_TYPE_MAP = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "video/mp4": "mp4",
  "video/avi": "avi",
  "video/mov": "mov",
  "video/wmv": "wmv",
  "video/webm": "webm",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/flac": "flac",
  "audio/aac": "aac",
  "text/plain": "txt",
  "text/html": "html",
  "text/css": "css",
  "text/javascript": "js",
  "application/json": "json",
  "application/pdf": "pdf",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
} as const;

// 媒体类型映射
export const MEDIA_TYPE_MAP = {
  "image/jpeg": "image",
  "image/jpg": "image",
  "image/png": "image",
  "image/gif": "image",
  "image/webp": "image",
  "image/bmp": "image",
  "image/tiff": "image",
  "video/mp4": "video",
  "video/avi": "video",
  "video/mov": "video",
  "video/wmv": "video",
  "video/webm": "video",
  "audio/mpeg": "audio",
  "audio/mp3": "audio",
  "audio/wav": "audio",
  "audio/flac": "audio",
  "audio/aac": "audio",
  "text/plain": "text",
  "text/html": "text",
  "text/css": "text",
  "text/javascript": "text",
  "application/json": "text",
  "application/pdf": "document",
  "application/zip": "archive",
  "application/x-zip-compressed": "archive",
} as const;

export type UploadResult = {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  duration?: number;
};
