import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../setup/integration-setup'
import CreateAppModal from '@/app/apps/components/CreateAppModal'

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

describe('App Creation Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create app with form submission', async () => {
    const user = userEvent.setup()

    // Mock successful app creation
    server.use(
      http.post('/api/apps', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({
          id: 1,
          ...body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { status: 201 })
      })
    )

    render(<CreateAppModal isOpen={true} onClose={jest.fn()} />)

    // Fill form
    await user.type(screen.getByLabelText(/应用名称/i), 'Test App')
    await user.type(screen.getByLabelText(/应用描述/i), 'Test Description')
    await user.selectOptions(screen.getByLabelText(/应用类型/i), 'web')
    await user.selectOptions(screen.getByLabelText(/平台/i), 'web')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /创建应用/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/应用创建成功/i)).toBeInTheDocument()
    })
  })

  it('should handle file upload during app creation', async () => {
    const user = userEvent.setup()

    // Mock file upload and app creation
    server.use(
      http.post('/api/upload', async ({ request }) => {
        return HttpResponse.json({
          success: true,
          url: 'https://example.com/uploaded-file.jpg'
        })
      }),
      http.post('/api/apps', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({
          id: 1,
          ...body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { status: 201 })
      })
    )

    render(<CreateAppModal isOpen={true} onClose={jest.fn()} />)

    // Fill form
    await user.type(screen.getByLabelText(/应用名称/i), 'Test App')
    await user.type(screen.getByLabelText(/应用描述/i), 'Test Description')
    await user.selectOptions(screen.getByLabelText(/应用类型/i), 'web')
    await user.selectOptions(screen.getByLabelText(/平台/i), 'web')

    // Upload file
    const fileInput = screen.getByLabelText(/封面图片/i)
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    await user.upload(fileInput, file)

    // Submit form
    const submitButton = screen.getByRole('button', { name: /创建应用/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/应用创建成功/i)).toBeInTheDocument()
    })
  })

  it('should handle QR code experience method', async () => {
    const user = userEvent.setup()

    // Mock QR code upload and app creation
    server.use(
      http.post('/api/upload', async ({ request }) => {
        return HttpResponse.json({
          success: true,
          url: 'https://example.com/qr-code.jpg'
        })
      }),
      http.post('/api/apps', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({
          id: 1,
          ...body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { status: 201 })
      })
    )

    render(<CreateAppModal isOpen={true} onClose={jest.fn()} />)

    // Fill form
    await user.type(screen.getByLabelText(/应用名称/i), 'Test App')
    await user.type(screen.getByLabelText(/应用描述/i), 'Test Description')
    await user.selectOptions(screen.getByLabelText(/应用类型/i), 'miniprogram')
    await user.selectOptions(screen.getByLabelText(/平台/i), 'wechat')
    await user.selectOptions(screen.getByLabelText(/体验方式/i), 'qrcode')

    // Upload QR code
    const qrInput = screen.getByLabelText(/二维码图片/i)
    const file = new File(['test'], 'qr.jpg', { type: 'image/jpeg' })
    await user.upload(qrInput, file)

    // Submit form
    const submitButton = screen.getByRole('button', { name: /创建应用/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/应用创建成功/i)).toBeInTheDocument()
    })
  })

  it('should show validation errors for invalid form data', async () => {
    const user = userEvent.setup()

    render(<CreateAppModal isOpen={true} onClose={jest.fn()} />)

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /创建应用/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/请填写应用名称/i)).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup()

    // Mock API error
    server.use(
      http.post('/api/apps', async ({ request }) => {
        return HttpResponse.json(
          { error: '创建应用失败' },
          { status: 500 }
        )
      })
    )

    render(<CreateAppModal isOpen={true} onClose={jest.fn()} />)

    // Fill form
    await user.type(screen.getByLabelText(/应用名称/i), 'Test App')
    await user.type(screen.getByLabelText(/应用描述/i), 'Test Description')
    await user.selectOptions(screen.getByLabelText(/应用类型/i), 'web')
    await user.selectOptions(screen.getByLabelText(/平台/i), 'web')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /创建应用/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/创建应用失败/i)).toBeInTheDocument()
    })
  })

  it('should reset form when modal is reopened', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    const { rerender } = render(<CreateAppModal isOpen={true} onClose={onClose} />)

    // Fill form
    await user.type(screen.getByLabelText(/应用名称/i), 'Test App')
    await user.type(screen.getByLabelText(/应用描述/i), 'Test Description')

    // Close modal
    await user.click(screen.getByRole('button', { name: /取消/i }))
    expect(onClose).toHaveBeenCalled()

    // Reopen modal
    rerender(<CreateAppModal isOpen={true} onClose={onClose} />)

    // Form should be reset
    expect(screen.getByLabelText(/应用名称/i)).toHaveValue('')
    expect(screen.getByLabelText(/应用描述/i)).toHaveValue('')
  })
})