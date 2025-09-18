import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CodeCopyButton from '../../../app/components/CodeCopyButton'

// Mock copy-to-clipboard
jest.mock('copy-to-clipboard', () => jest.fn())

describe('CodeCopyButton Component', () => {
  const mockCopy = require('copy-to-clipboard')
  const testCode = 'console.log("Hello, World!")'

  beforeEach(() => {
    mockCopy.mockClear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders copy button with correct text', () => {
    render(<CodeCopyButton code={testCode} />)
    
    expect(screen.getByRole('button', { name: /复制/i })).toBeInTheDocument()
    expect(screen.getByTitle('复制代码')).toBeInTheDocument()
  })

  it('copies code to clipboard when clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<CodeCopyButton code={testCode} />)
    
    const button = screen.getByRole('button', { name: /复制/i })
    await user.click(button)
    
    expect(mockCopy).toHaveBeenCalledWith(testCode)
  })

  it('shows copied state after clicking', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<CodeCopyButton code={testCode} />)
    
    const button = screen.getByRole('button', { name: /复制/i })
    await user.click(button)
    
    expect(screen.getByText('✓ 已复制')).toBeInTheDocument()
    expect(screen.getByTitle('已复制!')).toBeInTheDocument()
  })

  it('resets to original state after 2 seconds', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<CodeCopyButton code={testCode} />)
    
    const button = screen.getByRole('button', { name: /复制/i })
    await user.click(button)
    
    // Should show copied state
    expect(screen.getByText('✓ 已复制')).toBeInTheDocument()
    
    // Fast forward 2 seconds
    jest.advanceTimersByTime(2000)
    
    // Should reset to original state
    await waitFor(() => {
      expect(screen.getByText('复制')).toBeInTheDocument()
      expect(screen.getByTitle('复制代码')).toBeInTheDocument()
    })
  })

  it('has correct CSS classes', () => {
    render(<CodeCopyButton code={testCode} />)
    
    const button = screen.getByRole('button', { name: /复制/i })
    expect(button).toHaveClass('copy-button')
  })

  it('adds copied class when in copied state', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<CodeCopyButton code={testCode} />)
    
    const button = screen.getByRole('button', { name: /复制/i })
    await user.click(button)
    
    expect(button).toHaveClass('copy-button', 'copied')
  })

  it('handles empty code string', () => {
    render(<CodeCopyButton code="" />)
    
    const button = screen.getByRole('button', { name: /复制/i })
    fireEvent.click(button)
    
    expect(mockCopy).toHaveBeenCalledWith('')
  })

  it('handles long code strings', () => {
    const longCode = 'a'.repeat(1000)
    render(<CodeCopyButton code={longCode} />)
    
    const button = screen.getByRole('button', { name: /复制/i })
    fireEvent.click(button)
    
    expect(mockCopy).toHaveBeenCalledWith(longCode)
  })

  it('handles special characters in code', () => {
    const specialCode = 'const str = "Hello, 世界! 🌍";'
    render(<CodeCopyButton code={specialCode} />)
    
    const button = screen.getByRole('button', { name: /复制/i })
    fireEvent.click(button)
    
    expect(mockCopy).toHaveBeenCalledWith(specialCode)
  })

  it('can be clicked multiple times', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<CodeCopyButton code={testCode} />)
    
    const button = screen.getByRole('button', { name: /复制/i })
    
    // First click
    await user.click(button)
    expect(mockCopy).toHaveBeenCalledTimes(1)
    expect(screen.getByText('✓ 已复制')).toBeInTheDocument()
    
    // Reset timer
    jest.advanceTimersByTime(2000)
    await waitFor(() => {
      expect(screen.getByText('复制')).toBeInTheDocument()
    })
    
    // Second click
    await user.click(button)
    expect(mockCopy).toHaveBeenCalledTimes(2)
    expect(screen.getByText('✓ 已复制')).toBeInTheDocument()
  })
})
