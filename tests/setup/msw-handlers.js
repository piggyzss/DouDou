import { http, HttpResponse } from 'msw'

// Mock data
const mockApps = [
  {
    id: 1,
    name: 'Test App 1',
    slug: 'test-app-1',
    description: 'Test Description 1',
    tags: ['React', 'TypeScript'],
    type: 'web',
    platform: 'web',
    status: 'online',
    cover_image: 'https://example.com/cover1.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    dau: 100,
    downloads: 1000,
    likes: 50
  },
  {
    id: 2,
    name: 'Test App 2',
    slug: 'test-app-2',
    description: 'Test Description 2',
    tags: ['Vue', 'JavaScript'],
    type: 'miniprogram',
    platform: 'wechat',
    status: 'beta',
    cover_image: 'https://example.com/cover2.jpg',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    dau: 200,
    downloads: 2000,
    likes: 100
  }
]

// API handlers
export const handlers = [
  // Apps API
  http.get('/api/apps', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const status = url.searchParams.get('status') || 'online'
    const type = url.searchParams.get('type')
    const platform = url.searchParams.get('platform')
    const tag = url.searchParams.get('tag')

    let filteredApps = mockApps.filter(app => app.status === status)

    if (type) {
      filteredApps = filteredApps.filter(app => app.type === type)
    }

    if (platform) {
      filteredApps = filteredApps.filter(app => app.platform === platform)
    }

    if (tag) {
      filteredApps = filteredApps.filter(app => app.tags.includes(tag))
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedApps = filteredApps.slice(startIndex, endIndex)

    return HttpResponse.json({
      apps: paginatedApps,
      pagination: {
        page,
        limit,
        total: filteredApps.length,
        totalPages: Math.ceil(filteredApps.length / limit)
      }
    })
  }),

  http.get('/api/apps/:id', ({ params }) => {
    const { id } = params
    const app = mockApps.find(app => app.id === parseInt(id))

    if (!app) {
      return HttpResponse.json(
        { error: 'App not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json(app)
  }),

  http.post('/api/apps', async ({ request }) => {
    const body = await request.json()
    const newApp = {
      id: mockApps.length + 1,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    mockApps.push(newApp)

    return HttpResponse.json(newApp, { status: 201 })
  }),

  // Likes API
  http.post('/api/likes/status', async ({ request }) => {
    const body = await request.json()
    const { targets } = body
    
    // 模拟返回状态数组
    const statuses = targets.map(target => ({
      type: target.type,
      id: target.id,
      liked: Math.random() > 0.5,
      likesCount: Math.floor(Math.random() * 100)
    }))

    return HttpResponse.json({
      statuses
    })
  }),

  http.post('/api/likes/toggle', async ({ request }) => {
    const body = await request.json()
    const { targetType, targetId, action } = body

    return HttpResponse.json({
      liked: action === 'like',
      count: Math.floor(Math.random() * 100)
    })
  }),

  // App stats API
  http.get('/api/apps/:id/stats', ({ params }) => {
    const { id } = params
    const app = mockApps.find(app => app.id === parseInt(id))

    if (!app) {
      return HttpResponse.json(
        { error: 'App not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      dau: app.dau,
      downloads: app.downloads,
      likes: app.likes
    })
  }),

  // App like status API
  http.get('/api/apps/:id/like', ({ params }) => {
    const { id } = params
    const app = mockApps.find(app => app.id === parseInt(id))

    if (!app) {
      return HttpResponse.json(
        { error: 'App not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({
      liked: Math.random() > 0.5,
      count: app.likes
    })
  })
]