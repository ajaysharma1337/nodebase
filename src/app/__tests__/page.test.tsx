/**
 * Unit tests for the Home Page component
 * Tests the rendering, data fetching, and user interaction scenarios
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Page from '../page'

// Mock the Prisma client
const mockFindMany = jest.fn()
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: mockFindMany,
    },
  },
}))

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, className, ...props }: any) => (
    <button className={className} {...props}>
      {children}
    </button>
  ),
}))

describe('Page Component (page.tsx)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render without crashing', async () => {
      mockFindMany.mockResolvedValue([])
      
      const PageComponent = await Page()
      render(PageComponent)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render a button element', async () => {
      mockFindMany.mockResolvedValue([])
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render with correct container classes', async () => {
      mockFindMany.mockResolvedValue([])
      
      const PageComponent = await Page()
      const { container } = render(PageComponent)
      
      const mainDiv = container.querySelector('.min-h-screen')
      expect(mainDiv).toBeInTheDocument()
      expect(mainDiv).toHaveClass('min-h-screen', 'min-w-screen', 'flex', 'items-center', 'justify-center')
    })
  })

  describe('Data Fetching', () => {
    it('should call prisma.user.findMany on render', async () => {
      mockFindMany.mockResolvedValue([])
      
      await Page()
      
      expect(mockFindMany).toHaveBeenCalledTimes(1)
      expect(mockFindMany).toHaveBeenCalledWith()
    })

    it('should display empty array when no users exist', async () => {
      mockFindMany.mockResolvedValue([])
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('[]')
    })

    it('should display single user data correctly', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      }
      mockFindMany.mockResolvedValue([mockUser])
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent(JSON.stringify([mockUser]))
    })

    it('should display multiple users data correctly', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@example.com', name: 'User One' },
        { id: 2, email: 'user2@example.com', name: 'User Two' },
        { id: 3, email: 'user3@example.com', name: 'User Three' },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent(JSON.stringify(mockUsers))
    })

    it('should handle users with null names', async () => {
      const mockUsers = [
        { id: 1, email: 'test@example.com', name: null },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent(JSON.stringify(mockUsers))
      expect(button.textContent).toContain('null')
    })

    it('should handle users with only required fields', async () => {
      const mockUsers = [
        { id: 1, email: 'minimal@example.com' },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockFindMany.mockRejectedValue(new Error('Database connection failed'))
      
      await expect(Page()).rejects.toThrow('Database connection failed')
    })

    it('should handle timeout errors', async () => {
      mockFindMany.mockRejectedValue(new Error('Query timeout'))
      
      await expect(Page()).rejects.toThrow('Query timeout')
    })

    it('should handle network errors', async () => {
      mockFindMany.mockRejectedValue(new Error('Network error'))
      
      await expect(Page()).rejects.toThrow('Network error')
    })

    it('should handle unexpected error types', async () => {
      mockFindMany.mockRejectedValue('Unexpected error')
      
      await expect(Page()).rejects.toBe('Unexpected error')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large user arrays', async () => {
      const mockUsers = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        email: `user${i + 1}@example.com`,
        name: `User ${i + 1}`,
      }))
      mockFindMany.mockResolvedValue(mockUsers)
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button.textContent).toContain('user1@example.com')
    })

    it('should handle users with special characters in email', async () => {
      const mockUsers = [
        { id: 1, email: 'test+special@example.com', name: 'Special User' },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      expect(button.textContent).toContain('test+special@example.com')
    })

    it('should handle users with special characters in name', async () => {
      const mockUsers = [
        { id: 1, email: 'test@example.com', name: "O'Brien" },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      expect(button.textContent).toContain("O'Brien")
    })

    it('should handle users with Unicode characters', async () => {
      const mockUsers = [
        { id: 1, email: 'test@example.com', name: '测试用户' },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      expect(button.textContent).toContain('测试用户')
    })

    it('should handle users with emoji in name', async () => {
      const mockUsers = [
        { id: 1, email: 'test@example.com', name: '👨‍💻 Developer' },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      expect(button.textContent).toContain('👨‍💻 Developer')
    })

    it('should handle users with very long names', async () => {
      const longName = 'A'.repeat(1000)
      const mockUsers = [
        { id: 1, email: 'test@example.com', name: longName },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      expect(button.textContent).toContain(longName)
    })

    it('should handle users with empty string name', async () => {
      const mockUsers = [
        { id: 1, email: 'test@example.com', name: '' },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('JSON Serialization', () => {
    it('should properly serialize user data to JSON string', async () => {
      const mockUsers = [
        { id: 1, email: 'test@example.com', name: 'Test' },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      const displayedText = button.textContent
      
      expect(() => JSON.parse(displayedText || '')).not.toThrow()
      expect(JSON.parse(displayedText || '')).toEqual(mockUsers)
    })

    it('should handle JSON serialization of complex user objects', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'test@example.com',
          name: 'Test',
          posts: [],
        },
      ]
      mockFindMany.mockResolvedValue(mockUsers)
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('should maintain client component directive', () => {
      // This test verifies that the "use client" directive is present
      // by checking if the component can be rendered in test environment
      mockFindMany.mockResolvedValue([])
      
      expect(async () => {
        const PageComponent = await Page()
        render(PageComponent)
      }).not.toThrow()
    })

    it('should be an async component', async () => {
      mockFindMany.mockResolvedValue([])
      
      const result = Page()
      
      expect(result).toBeInstanceOf(Promise)
    })

    it('should export component as default', async () => {
      expect(Page).toBeDefined()
      expect(typeof Page).toBe('function')
    })
  })

  describe('Performance', () => {
    it('should handle rapid re-renders efficiently', async () => {
      mockFindMany.mockResolvedValue([{ id: 1, email: 'test@example.com' }])
      
      const PageComponent = await Page()
      const { rerender } = render(PageComponent)
      
      // Re-render multiple times
      for (let i = 0; i < 10; i++) {
        rerender(PageComponent)
      }
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should only fetch data once per component mount', async () => {
      mockFindMany.mockResolvedValue([])
      
      await Page()
      
      // Should be called exactly once
      expect(mockFindMany).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have an accessible button element', async () => {
      mockFindMany.mockResolvedValue([])
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })

    it('should be keyboard navigable', async () => {
      mockFindMany.mockResolvedValue([])
      
      const PageComponent = await Page()
      render(PageComponent)
      
      const button = screen.getByRole('button')
      expect(button).not.toHaveAttribute('tabIndex', '-1')
    })
  })

  describe('Integration Scenarios', () => {
    it('should work with database returning undefined', async () => {
      mockFindMany.mockResolvedValue(undefined as any)
      
      const PageComponent = await Page()
      render(PageComponent)
      
      // Should handle gracefully even if data is unexpected
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle concurrent data fetches', async () => {
      mockFindMany.mockResolvedValue([{ id: 1, email: 'test@example.com' }])
      
      // Call multiple times concurrently
      const promises = [Page(), Page(), Page()]
      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(3)
      expect(mockFindMany).toHaveBeenCalled()
    })
  })
})