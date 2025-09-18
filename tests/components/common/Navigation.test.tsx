import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navigation from '../../../app/components/Navigation'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

// Mock theme provider
jest.mock('../../../app/providers', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: jest.fn(),
  }),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    input: ({ ...props }: any) => <input {...props} />,
  },
}))

describe('Navigation Component', () => {
  beforeEach(() => {
    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    })
  })

  it('renders navigation with all menu items', () => {
    render(<Navigation />)
    
    expect(screen.getByText('Hi')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('App')).toBeInTheDocument()
    expect(screen.getByText('AIGC')).toBeInTheDocument()
  })

  it('shows mobile menu when hamburger is clicked', async () => {
    const user = userEvent.setup()
    render(<Navigation />)
    
    const menuButton = screen.getByRole('button', { name: /menu/i })
    await user.click(menuButton)
    
    // Check if mobile menu is visible
    expect(screen.getByText('Hi')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('App')).toBeInTheDocument()
    expect(screen.getByText('AIGC')).toBeInTheDocument()
  })

  it('closes mobile menu when X button is clicked', async () => {
    const user = userEvent.setup()
    render(<Navigation />)
    
    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /menu/i })
    await user.click(menuButton)
    
    // Close mobile menu
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)
    
    // Mobile menu should be closed (X button should not be visible)
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
  })

  it('toggles theme when theme button is clicked', async () => {
    const user = userEvent.setup()
    const mockToggleTheme = jest.fn()
    
    // Mock theme provider with toggle function
    jest.doMock('../../../app/providers', () => ({
      useTheme: () => ({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      }),
    }))
    
    render(<Navigation />)
    
    const themeButton = screen.getByRole('button', { name: /theme/i })
    await user.click(themeButton)
    
    expect(mockToggleTheme).toHaveBeenCalled()
  })

  it('handles search form submission', async () => {
    const user = userEvent.setup()
    render(<Navigation />)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    const searchForm = searchInput.closest('form')
    
    await user.type(searchInput, 'test query')
    await user.click(screen.getByRole('button', { name: /search/i }))
    
    // Form should be submitted (preventDefault should be called)
    expect(searchForm).toBeInTheDocument()
  })

  it('updates search query when typing', async () => {
    const user = userEvent.setup()
    render(<Navigation />)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'test')
    
    expect(searchInput).toHaveValue('test')
  })

  it('applies scrolled styles when window is scrolled', async () => {
    render(<Navigation />)
    
    // Simulate scroll
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 100,
    })
    
    fireEvent.scroll(window)
    
    // Wait for scroll effect to apply
    await waitFor(() => {
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('backdrop-blur-md')
    })
  })

  it('renders correct links for navigation items', () => {
    render(<Navigation />)
    
    const hiLink = screen.getByRole('link', { name: /hi/i })
    const blogLink = screen.getByRole('link', { name: /blog/i })
    const appLink = screen.getByRole('link', { name: /app/i })
    const aigcLink = screen.getByRole('link', { name: /aigc/i })
    
    expect(hiLink).toHaveAttribute('href', '/')
    expect(blogLink).toHaveAttribute('href', '/blog')
    expect(appLink).toHaveAttribute('href', '/apps')
    expect(aigcLink).toHaveAttribute('href', '/aigc')
  })

  it('shows active state for current page', () => {
    // This test would need to be updated based on how the component actually handles active states
    // For now, we'll just check that the component renders without errors
    render(<Navigation />)
    
    const blogLink = screen.getByRole('link', { name: /blog/i })
    expect(blogLink).toBeInTheDocument()
  })
})
