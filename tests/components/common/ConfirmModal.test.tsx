import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmModal from '../../../app/components/ConfirmModal'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}))

describe('ConfirmModal Component', () => {
  const mockOnClose = jest.fn()
  const mockOnConfirm = jest.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: '确认删除',
    message: '您确定要删除这个项目吗？此操作不可撤销。',
  }

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnConfirm.mockClear()
  })

  it('renders modal when isOpen is true', () => {
    render(<ConfirmModal {...defaultProps} />)
    
    expect(screen.getByText('确认删除')).toBeInTheDocument()
    expect(screen.getByText('您确定要删除这个项目吗？此操作不可撤销。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /确认/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /取消/i })).toBeInTheDocument()
  })

  it('does not render modal when isOpen is false', () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('确认删除')).not.toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    render(<ConfirmModal {...defaultProps} />)
    
    const confirmButton = screen.getByRole('button', { name: /确认/i })
    await user.click(confirmButton)
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<ConfirmModal {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /取消/i })
    await user.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking outside modal', async () => {
    const user = userEvent.setup()
    render(<ConfirmModal {...defaultProps} />)
    
    const backdrop = screen.getByText('确认删除').closest('div')?.parentElement
    await user.click(backdrop!)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('renders with custom confirm and cancel text', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        confirmText="删除"
        cancelText="保留"
      />
    )
    
    expect(screen.getByRole('button', { name: /删除/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /保留/i })).toBeInTheDocument()
  })

  it('renders danger type with correct styling', () => {
    render(<ConfirmModal {...defaultProps} type="danger" />)
    
    const confirmButton = screen.getByRole('button', { name: /确认/i })
    expect(confirmButton).toHaveClass('bg-red-500', 'hover:bg-red-600', 'text-white')
  })

  it('renders warning type with correct styling', () => {
    render(<ConfirmModal {...defaultProps} type="warning" />)
    
    const confirmButton = screen.getByRole('button', { name: /确认/i })
    expect(confirmButton).toHaveClass('bg-yellow-500', 'hover:bg-yellow-600', 'text-white')
  })

  it('renders info type with correct styling', () => {
    render(<ConfirmModal {...defaultProps} type="info" />)
    
    const confirmButton = screen.getByRole('button', { name: /确认/i })
    expect(confirmButton).toHaveClass('bg-blue-500', 'hover:bg-blue-600', 'text-white')
  })

  it('shows correct icon for danger type', () => {
    render(<ConfirmModal {...defaultProps} type="danger" />)
    
    // Check for AlertTriangle icon (danger type)
    const icon = screen.getByRole('button', { name: /确认/i }).closest('div')?.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('shows correct icon for warning type', () => {
    render(<ConfirmModal {...defaultProps} type="warning" />)
    
    // Check for AlertCircle icon (warning type)
    const icon = screen.getByRole('button', { name: /确认/i }).closest('div')?.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('shows correct icon for info type', () => {
    render(<ConfirmModal {...defaultProps} type="info" />)
    
    // Check for Info icon (info type)
    const icon = screen.getByRole('button', { name: /确认/i }).closest('div')?.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('handles keyboard escape key', () => {
    render(<ConfirmModal {...defaultProps} />)
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('prevents event propagation when clicking modal content', async () => {
    const user = userEvent.setup()
    render(<ConfirmModal {...defaultProps} />)
    
    const modalContent = screen.getByText('确认删除').closest('div')
    await user.click(modalContent!)
    
    // onClose should not be called when clicking modal content
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('renders with different title and message', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        title="保存更改"
        message="您有未保存的更改，是否要保存？"
      />
    )
    
    expect(screen.getByText('保存更改')).toBeInTheDocument()
    expect(screen.getByText('您有未保存的更改，是否要保存？')).toBeInTheDocument()
  })
})
