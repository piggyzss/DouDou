import { configure } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { handlers } from './msw-handlers'

// Configure React Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
  // Increase timeout for integration tests
  getElementError: (message, container) => {
    const error = new Error(message)
    error.name = 'TestingLibraryElementError'
    error.stack = null
    return error
  }
})

// Create MSW server for integration tests
export const server = setupServer(...handlers)

// Global setup for integration tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error'
  })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

// Mock environment variables for integration tests
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'

// Global test utilities for integration tests
export const createMockUser = () => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com'
})

export const createMockApp = (overrides = {}) => ({
  id: 1,
  name: 'Test App',
  slug: 'test-app',
  description: 'Test Description',
  tags: ['React', 'TypeScript'],
  type: 'app',
  platform: 'web',
  status: 'online',
  experience_method: 'download',
  download_url: 'https://example.com/download',
  cover_image_url: 'https://example.com/cover.jpg',
  video_url: 'https://example.com/video.mp4',
  dau: 100,
  downloads: 1000,
  likes_count: 50,
  trend: 'rising',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  published_at: '2024-01-01T00:00:00Z',
  ...overrides
})

export const createMockBlogPost = (overrides = {}) => ({
  id: 1,
  slug: 'test-blog-post',
  title: 'Test Blog Post',
  content: 'Test content',
  excerpt: 'Test excerpt',
  tags: ['blog', 'test'],
  status: 'published',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  published_at: '2024-01-01T00:00:00Z',
  views_count: 100,
  likes_count: 10,
  ...overrides
})

export const createMockArtwork = (overrides = {}) => ({
  id: 1,
  title: 'Test Artwork',
  description: 'Test artwork description',
  tags: ['art', 'ai'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  likes_count: 20,
  views_count: 200,
  status: 'active',
  cover_image_url: 'https://example.com/artwork.jpg',
  images: [
    {
      id: 1,
      collection_id: 1,
      filename: 'artwork.jpg',
      original_name: 'artwork.jpg',
      file_url: 'https://example.com/artwork.jpg',
      file_size: 1024000,
      width: 1920,
      height: 1080,
      mime_type: 'image/jpeg',
      created_at: '2024-01-01T00:00:00Z',
      sort_order: 0
    }
  ],
  ...overrides
})

// Helper function to wait for async operations
export const waitForAsync = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to create mock file
export const createMockFile = (name = 'test.jpg', type = 'image/jpeg', content = 'test content') => {
  return new File([content], name, { type })
}

// Helper function to create mock FormData
export const createMockFormData = (data = {}) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value)
    } else {
      formData.append(key, String(value))
    }
  })
  return formData
}
