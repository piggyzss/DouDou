import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import BackToTop from '../../../app/components/BackToTop'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}))

// Mock window.scrollTo
const mockScrollTo = jest.fn()
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
})

describe('BackToTop Component', () => {
  beforeEach(() => {
    // Reset mocks
    mockScrollTo.mockClear()
    
    // Mock window.pageYOffset
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 0,
    })
  })

  it('does not render button when page is not scrolled', () => {
    render(<BackToTop />)
    
    expect(screen.queryByRole('button', { name: /回到顶部/i })).not.toBeInTheDocument()
  })

  it('renders button when page is scrolled more than 300px', () => {
    // Mock scroll position
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 400,
    })
    
    render(<BackToTop />)
    
    // Trigger scroll event
    fireEvent.scroll(window)
    
    expect(screen.getByRole('button', { name: /回到顶部/i })).toBeInTheDocument()
  })

  it('hides button when page is scrolled less than 300px', () => {
    // Mock scroll position
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 200,
    })
    
    render(<BackToTop />)
    
    // Trigger scroll event
    fireEvent.scroll(window)
    
    expect(screen.queryByRole('button', { name: /回到顶部/i })).not.toBeInTheDocument()
  })

  it('scrolls to top when button is clicked', () => {
    // Mock scroll position to show button
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 400,
    })
    
    render(<BackToTop />)
    
    // Trigger scroll event to show button
    fireEvent.scroll(window)
    
    const button = screen.getByRole('button', { name: /回到顶部/i })
    fireEvent.click(button)
    
    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth'
    })
  })

  it('has correct styling classes', () => {
    // Mock scroll position to show button
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 400,
    })
    
    render(<BackToTop />)
    
    // Trigger scroll event to show button
    fireEvent.scroll(window)
    
    const button = screen.getByRole('button', { name: /回到顶部/i })
    expect(button).toHaveClass(
      'fixed',
      'bottom-8',
      'right-48',
      'z-50',
      'p-3',
      'bg-white',
      'dark:bg-gray-800',
      'rounded-full',
      'shadow-lg',
      'hover:shadow-xl',
      'transition-all',
      'duration-300',
      'border',
      'border-gray-200',
      'dark:border-gray-700',
      'hover:border-primary',
      'group'
    )
  })

  it('has proper accessibility attributes', () => {
    // Mock scroll position to show button
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 400,
    })
    
    render(<BackToTop />)
    
    // Trigger scroll event to show button
    fireEvent.scroll(window)
    
    const button = screen.getByRole('button', { name: /回到顶部/i })
    expect(button).toHaveAttribute('aria-label', '回到顶部')
  })

  it('cleans up scroll event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
    
    const { unmount } = render(<BackToTop />)
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    
    removeEventListenerSpy.mockRestore()
  })

  it('shows and hides button based on scroll position changes', () => {
    render(<BackToTop />)
    
    // Initially hidden
    expect(screen.queryByRole('button', { name: /回到顶部/i })).not.toBeInTheDocument()
    
    // Scroll down - should show
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 400,
    })
    fireEvent.scroll(window)
    expect(screen.getByRole('button', { name: /回到顶部/i })).toBeInTheDocument()
    
    // Scroll back up - should hide
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 200,
    })
    fireEvent.scroll(window)
    expect(screen.queryByRole('button', { name: /回到顶部/i })).not.toBeInTheDocument()
  })
})
