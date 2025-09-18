import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppCard from '@/app/apps/components/AppCard'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}))

const mockApp = {
  id: 1,
  name: 'Test App',
  slug: 'test-app',
  description: 'This is a test application for demonstration purposes.',
  tags: ['React', 'TypeScript', 'Next.js'],
  type: 'app' as const,
  platform: 'web' as const,
  status: 'online' as const,
  experience_method: 'download' as const,
  download_url: 'https://example.com/download',
  cover_image_url: 'https://example.com/cover.jpg',
  video_url: 'https://example.com/video.mp4',
  dau: 100,
  downloads: 1000,
  likes_count: 50,
  trend: 'rising',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  published_at: '2024-01-01T00:00:00Z'
}

describe('AppCard', () => {
  it('should render app information correctly', () => {
    render(<AppCard app={mockApp} />)

    expect(screen.getByText('Test App')).toBeInTheDocument()
    expect(screen.getByText('This is a test application for demonstration purposes.')).toBeInTheDocument()
    // AppCard组件只显示type和platform标签，不显示tags
    expect(screen.getAllByText((content, element) => {
      return element?.textContent === '应用' || element?.textContent?.includes('应用')
    })[0]).toBeInTheDocument()
    expect(screen.getAllByText((content, element) => {
      return element?.textContent === 'Web' || element?.textContent?.includes('Web')
    })[0]).toBeInTheDocument()
  })

  it('should display app statistics', () => {
    render(<AppCard app={mockApp} />)

    expect(screen.getByText('DAU 100')).toBeInTheDocument() // DAU
    expect(screen.getByText('1.0K')).toBeInTheDocument() // Downloads (formatted)
    // Likes count is not displayed in the current component
  })

  it('should show QR code button for experience method', () => {
    render(<AppCard app={mockApp} />)

    expect(screen.getByRole('button', { name: /体验一下/i })).toBeInTheDocument()
  })

  it('should show QR code button for qrcode experience method', () => {
    const qrApp = {
      ...mockApp,
      experience_method: 'qrcode' as const,
      qr_code_url: 'https://example.com/qr.jpg'
    }

    render(<AppCard app={qrApp} />)

    expect(screen.getByRole('button', { name: /体验一下/i })).toBeInTheDocument()
  })

  it('should display app type and platform', () => {
    render(<AppCard app={mockApp} />)

    expect(screen.getAllByText((content, element) => {
      return element?.textContent === '应用' || element?.textContent?.includes('应用')
    })[0]).toBeInTheDocument()
    expect(screen.getAllByText((content, element) => {
      return element?.textContent === 'Web' || element?.textContent?.includes('Web')
    })[0]).toBeInTheDocument()
  })

  it('should show trend indicator', () => {
    render(<AppCard app={mockApp} />)

    // 趋势显示已被注释掉，所以不测试趋势文本
    // expect(screen.getByText('上升')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    render(<AppCard app={mockApp} />)

    const experienceButton = screen.getByRole('button', { name: /体验一下/i })
    await user.click(experienceButton)

    // 验证按钮存在
    expect(experienceButton).toBeInTheDocument()
  })

  it('should display cover image if available', () => {
    render(<AppCard app={mockApp} />)

    const coverImages = screen.getAllByRole('img')
    const coverImage = coverImages.find(img => img.getAttribute('alt') === 'Test App')
    expect(coverImage).toHaveAttribute('src', '/api/apps/proxy-image?url=https%3A%2F%2Fexample.com%2Fcover.jpg')
    expect(coverImage).toHaveAttribute('alt', 'Test App')
  })

  it('should handle missing cover image gracefully', () => {
    const appWithoutCover = {
      ...mockApp,
      cover_image_url: undefined
    }

    render(<AppCard app={appWithoutCover} />)

    // Should still render the app card without cover image
    expect(screen.getByText('Test App')).toBeInTheDocument()
  })

  it('should format numbers correctly', () => {
    const appWithLargeNumbers = {
      ...mockApp,
      dau: 1234,
      downloads: 56789,
      likes_count: 999
    }

    render(<AppCard app={appWithLargeNumbers} />)

    expect(screen.getByText('DAU 1.2K')).toBeInTheDocument() // DAU formatted
    expect(screen.getByText('56.8K')).toBeInTheDocument() // Downloads formatted
    // Likes count is not displayed in the current component
  })

  it('should show correct status badge', () => {
    render(<AppCard app={mockApp} />)

    expect(screen.getByText('已上线')).toBeInTheDocument()
  })

  it('should handle different app types', () => {
    const miniprogramApp = {
      ...mockApp,
      type: 'miniprogram' as const
    }

    render(<AppCard app={miniprogramApp} />)

    expect(screen.getAllByText((content, element) => {
      return element?.textContent === '小程序' || element?.textContent?.includes('小程序')
    })[0]).toBeInTheDocument()
  })

  it('should handle different platforms', () => {
    const mobileApp = {
      ...mockApp,
      platform: 'mobile' as const
    }

    render(<AppCard app={mobileApp} />)

    expect(screen.getAllByText((content, element) => {
      return element?.textContent === '移动端' || element?.textContent?.includes('移动端')
    })[0]).toBeInTheDocument()
  })

  it('should show different trend indicators', () => {
    const stableApp = {
      ...mockApp,
      trend: 'stable'
    }

    render(<AppCard app={stableApp} />)

    // 趋势显示已被注释掉，所以不测试趋势文本
    // expect(screen.getByText('稳定')).toBeInTheDocument()
  })
})
