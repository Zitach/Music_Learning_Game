import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div data-testid="normal-child">Normal content</div>
}

describe('ErrorBoundary', () => {
  it('catches errors in child tree and shows error UI', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('出错了，请刷新页面重试')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /刷新页面/i })).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })

  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('normal-child')).toBeInTheDocument()
    expect(screen.queryByText('出错了，请刷新页面重试')).not.toBeInTheDocument()
  })
})
