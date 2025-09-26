import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LikeToggle from '@/app/components/LikeToggle'

// Mock fetch
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    span: ({ children, ...props }: any) => {
      const { whileHover, whileTap, layoutId, initial, animate, variants, transition, ...restProps } = props
      return <span {...restProps}>{children}</span>
    },
  },
}))

describe('LikeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultProps = {
    targetType: 'blog' as const,
    targetId: 1
  }

  it('should render like button', async () => {
    // Mock initial status fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ statuses: [{ liked: false, likesCount: 0 }] })
    } as Response)

    render(<LikeToggle {...defaultProps} />)

    // Wait for initial status to load
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  it('should show initial like count', async () => {
    // Mock initial status fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ statuses: [{ liked: false, likesCount: 10 }] })
    } as Response)

    render(<LikeToggle {...defaultProps} initialCount={10} />)

    // Wait for initial status to load
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })

  it('should show liked state when initially liked', async () => {
    // Mock initial status fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ statuses: [{ liked: true, likesCount: 0 }] })
    } as Response)

    render(<LikeToggle {...defaultProps} initialLiked={true} />)

    // Wait for initial status to load
    await waitFor(() => {
      const heartIcon = screen.getByRole('button').querySelector('svg')
      expect(heartIcon).toHaveClass('text-red-500')
    })
  })

  it('should show unliked state when initially not liked', async () => {
    // Mock initial status fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ statuses: [{ liked: false, likesCount: 0 }] })
    } as Response)

    render(<LikeToggle {...defaultProps} initialLiked={false} />)

    // Wait for initial status to load
    await waitFor(() => {
      const heartIcon = screen.getByRole('button').querySelector('svg')
      expect(heartIcon).toHaveClass('text-text-muted')
    })
  })

  it('should toggle like state on click', async () => {
    const user = userEvent.setup()
    
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ statuses: [{ liked: false, likesCount: 10 }] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ liked: true, likesCount: 11 })
      })

    render(<LikeToggle {...defaultProps} initialCount={10} initialLiked={false} />)

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      const heartIcon = button.querySelector('svg')
      expect(heartIcon).toHaveClass('text-red-500')
      expect(screen.getByText('11')).toBeInTheDocument()
    })
  })

  it('should handle like toggle API call', async () => {
    const user = userEvent.setup()
    
    // Mock initial status fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ statuses: [{ liked: false, likesCount: 10 }] })
    } as Response)
    // Mock toggle API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, liked: true, likes_count: 11 })
    } as Response)

    render(<LikeToggle {...defaultProps} initialCount={10} />)

    // Wait for initial status to load
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockFetch).toHaveBeenCalledWith('/api/likes/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetType: 'blog',
        targetId: 1,
        action: 'like'
      })
    })
  })

  it('should handle API error gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock initial status fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ statuses: [{ liked: false, likesCount: 10 }] })
    } as Response)
    // Mock failed toggle API call
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    } as Response)

    render(<LikeToggle {...defaultProps} initialCount={10} initialLiked={false} />)

    // Wait for initial status to load
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    const button = screen.getByRole('button')
    await user.click(button)

    // Should not change state on error
    await waitFor(() => {
      const heartIcon = button.querySelector('svg')
      expect(heartIcon).toHaveClass('text-text-muted')
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })

  it('should show loading state during API call', async () => {
    const user = userEvent.setup()
    
    // Mock initial status fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ statuses: [{ liked: false, likesCount: 10 }] })
    } as Response)
    // Mock slow toggle API call
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ liked: true, likesCount: 11 })
        } as Response), 100)
      )
    )

    render(<LikeToggle {...defaultProps} initialCount={10} />)

    // Wait for initial status to load
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    const button = screen.getByRole('button')
    await user.click(button)

    // Should show loading state
    expect(button).toBeDisabled()
  })

  it('should handle different target types', async () => {
    const user = userEvent.setup()
    
    // Mock initial status fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ statuses: [{ liked: false, likesCount: 5 }] })
    } as Response)
    // Mock toggle API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, liked: true, likes_count: 6 })
    } as Response)

    render(<LikeToggle targetType="artwork" targetId={2} initialCount={5} />)

    // Wait for initial status to load
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockFetch).toHaveBeenCalledWith('/api/likes/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetType: 'artwork',
        targetId: 2,
        action: 'like'
      })
    })
  })

  it('should call onLikeChange callback when provided', async () => {
    const user = userEvent.setup()
    const onLikeChange = jest.fn()
    
    // Mock initial status fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ statuses: [{ liked: false, likesCount: 10 }] })
    } as Response)
    // Mock toggle API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ liked: true, likesCount: 11 })
    } as Response)

    render(
      <LikeToggle 
        {...defaultProps} 
        initialCount={10} 
        onChanged={onLikeChange} 
      />
    )

    // Wait for initial status to load
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(onLikeChange).toHaveBeenCalledWith(true, 11)
    })
  })

  it('should be disabled when busy', async () => {
    const user = userEvent.setup()
    
    // Mock initial status fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ statuses: [{ liked: false, likesCount: 10 }] })
    } as Response)
    // Mock slow toggle API call
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ liked: true, likesCount: 11 })
        } as Response), 100)
      )
    )

    render(<LikeToggle {...defaultProps} initialCount={10} />)

    // Wait for initial status to load
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    const button = screen.getByRole('button')
    await user.click(button)

    // Should be disabled during API call
    expect(button).toBeDisabled()
  })

  it('should show custom like count format', async () => {
    // Mock initial status fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ statuses: [{ liked: false, likesCount: 1000 }] })
    } as Response)

    render(<LikeToggle {...defaultProps} initialCount={1000} />)

    // Wait for initial status to load
    await waitFor(() => {
      expect(screen.getByText('1000')).toBeInTheDocument()
    })
  })

  it('should handle large like counts', async () => {
    // Mock initial status fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ statuses: [{ liked: false, likesCount: 1234567 }] })
    } as Response)

    render(<LikeToggle {...defaultProps} initialCount={1234567} />)

    // Wait for initial status to load
    await waitFor(() => {
      expect(screen.getByText('1234567')).toBeInTheDocument()
    })
  })
})
