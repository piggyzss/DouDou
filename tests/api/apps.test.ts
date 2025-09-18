import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/apps/route'

// Mock database and models
jest.mock('@/lib/models/app', () => ({
  AppModel: {
    findAll: jest.fn(),
    create: jest.fn()
  }
}))

jest.mock('@/lib/tencent-cos', () => ({
  uploadFile: jest.fn()
}))

import { AppModel } from '@/lib/models/app'
import { uploadFile } from '@/lib/tencent-cos'

const mockAppModel = AppModel as jest.Mocked<typeof AppModel>
const mockUploadFile = uploadFile as jest.MockedFunction<typeof uploadFile>

describe('/api/apps', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return apps list with default parameters', async () => {
      const mockApps = [
        {
          id: 1,
          name: 'Test App',
          slug: 'test-app',
          description: 'Test Description',
          tags: ['React'],
          type: 'app',
          platform: 'web',
          status: 'online',
          experience_method: 'download',
          dau: 100,
          downloads: 1000,
          likes_count: 50,
          trend: 'rising',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      const mockResult = {
        apps: mockApps,
        total: 1,
        totalPages: 1,
        currentPage: 1
      }

      mockAppModel.findAll.mockResolvedValue(mockResult)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/apps'
      })

      const response = await GET(req)
      const data = await response.json()

      expect(mockAppModel.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: 'online',
        type: undefined,
        platform: undefined,
        tag: undefined
      })

      expect(response.status).toBe(200)
      expect(data).toEqual(mockResult)
    })

    it('should return apps list with custom parameters', async () => {
      const mockResult = {
        apps: [],
        total: 0,
        totalPages: 0,
        currentPage: 2
      }

      mockAppModel.findAll.mockResolvedValue(mockResult)

      const { req } = createMocks({
        method: 'GET',
        url: '/api/apps?page=2&limit=5&status=beta&type=miniprogram&platform=wechat&tag=React'
      })

      const response = await GET(req)

      expect(mockAppModel.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        status: 'beta',
        type: 'miniprogram',
        platform: 'wechat',
        tag: 'React'
      })

      expect(response.status).toBe(200)
    })

    it('should handle database errors', async () => {
      mockAppModel.findAll.mockRejectedValue(new Error('Database error'))

      const { req } = createMocks({
        method: 'GET',
        url: '/api/apps'
      })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: '获取应用列表失败' })
    })
  })

  describe('POST', () => {
    it('should create app with valid data', async () => {
      const mockApp = {
        id: 1,
        name: 'New App',
        slug: 'new-app',
        description: 'New Description',
        tags: ['React'],
        type: 'app',
        platform: 'web',
        status: 'online',
        experience_method: 'download',
        download_url: 'https://example.com/download',
        dau: 0,
        downloads: 0,
        likes_count: 0,
        trend: 'stable',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      mockAppModel.create.mockResolvedValue(mockApp)

      const formData = new FormData()
      formData.append('name', 'New App')
      formData.append('description', 'New Description')
      formData.append('tags', 'React')
      formData.append('type', 'app')
      formData.append('platform', 'web')
      formData.append('status', 'online')
      formData.append('experience_method', 'download')
      formData.append('download_url', 'https://example.com/download')

      const { req } = createMocks({
        method: 'POST',
        body: formData
      })

      const response = await POST(req)
      const data = await response.json()

      expect(mockAppModel.create).toHaveBeenCalledWith({
        name: 'New App',
        description: 'New Description',
        tags: ['React'],
        type: 'app',
        platform: 'web',
        status: 'online',
        experience_method: 'download',
        download_url: 'https://example.com/download'
      })

      expect(response.status).toBe(201)
      expect(data).toEqual(mockApp)
    })

    it('should handle file uploads', async () => {
      const mockApp = {
        id: 1,
        name: 'New App',
        slug: 'new-app'
      }

      mockAppModel.create.mockResolvedValue(mockApp)
      mockUploadFile.mockResolvedValue({
        success: true,
        url: 'https://example.com/uploaded-cover.jpg'
      })

      const formData = new FormData()
      formData.append('name', 'New App')
      formData.append('description', 'New Description')
      formData.append('type', 'app')
      formData.append('platform', 'web')
      formData.append('status', 'online')
      formData.append('experience_method', 'download')

      // Create a mock file
      const mockFile = new File(['test content'], 'cover.jpg', { type: 'image/jpeg' })
      formData.append('cover_image', mockFile)

      const { req } = createMocks({
        method: 'POST',
        body: formData
      })

      const response = await POST(req)

      expect(mockUploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        'cover.jpg',
        'image/jpeg',
        'apps/covers/'
      )

      expect(response.status).toBe(201)
    })

    it('should validate required fields', async () => {
      const formData = new FormData()
      formData.append('name', 'New App')
      // Missing required fields

      const { req } = createMocks({
        method: 'POST',
        body: formData
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: '缺少必填字段' })
    })

    it('should validate download URL for download method', async () => {
      const formData = new FormData()
      formData.append('name', 'New App')
      formData.append('description', 'New Description')
      formData.append('type', 'app')
      formData.append('platform', 'web')
      formData.append('status', 'online')
      formData.append('experience_method', 'download')
      // Missing download_url

      const { req } = createMocks({
        method: 'POST',
        body: formData
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: '下载方式需要提供下载链接' })
    })

    it('should validate QR code for qrcode method', async () => {
      const formData = new FormData()
      formData.append('name', 'New App')
      formData.append('description', 'New Description')
      formData.append('type', 'app')
      formData.append('platform', 'web')
      formData.append('status', 'online')
      formData.append('experience_method', 'qrcode')
      // Missing QR code file

      const { req } = createMocks({
        method: 'POST',
        body: formData
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: '二维码方式需要上传二维码图片' })
    })

    it('should validate tag count limit', async () => {
      const formData = new FormData()
      formData.append('name', 'New App')
      formData.append('description', 'New Description')
      formData.append('tags', 'tag1,tag2,tag3,tag4,tag5,tag6') // 6 tags
      formData.append('type', 'app')
      formData.append('platform', 'web')
      formData.append('status', 'online')
      formData.append('experience_method', 'download')
      formData.append('download_url', 'https://example.com/download')

      const { req } = createMocks({
        method: 'POST',
        body: formData
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: '标签数量不能超过5个' })
    })

    it('should handle file upload errors', async () => {
      mockUploadFile.mockResolvedValue({
        success: false,
        error: 'Upload failed'
      })

      const formData = new FormData()
      formData.append('name', 'New App')
      formData.append('description', 'New Description')
      formData.append('type', 'app')
      formData.append('platform', 'web')
      formData.append('status', 'online')
      formData.append('experience_method', 'download')
      formData.append('download_url', 'https://example.com/download')

      const mockFile = new File(['test content'], 'cover.jpg', { type: 'image/jpeg' })
      formData.append('cover_image', mockFile)

      const { req } = createMocks({
        method: 'POST',
        body: formData
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: '封面上传失败' })
    })

    it('should handle database creation errors', async () => {
      mockAppModel.create.mockRejectedValue(new Error('Database error'))

      const formData = new FormData()
      formData.append('name', 'New App')
      formData.append('description', 'New Description')
      formData.append('type', 'app')
      formData.append('platform', 'web')
      formData.append('status', 'online')
      formData.append('experience_method', 'download')
      formData.append('download_url', 'https://example.com/download')

      const { req } = createMocks({
        method: 'POST',
        body: formData
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: '创建应用失败' })
    })
  })
})
