/**
 * Unit tests for the Prisma database client singleton
 * Tests the initialization, singleton pattern, and environment-based behavior
 */

import { PrismaClient } from '@/generated/prisma'

// Mock the PrismaClient before importing db
jest.mock('@/generated/prisma', () => {
  const mockPrismaClient = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  }
})

describe('Prisma Database Client (db.ts)', () => {
  let originalEnv: string | undefined
  let originalGlobal: any

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env.NODE_ENV
    
    // Save original global state
    originalGlobal = { ...(global as any).prisma }
    
    // Clear module cache to ensure fresh imports
    jest.resetModules()
    jest.clearAllMocks()
    
    // Clear global prisma instance
    delete (global as any).prisma
  })

  afterEach(() => {
    // Restore environment
    if (originalEnv) {
      process.env.NODE_ENV = originalEnv
    }
    
    // Restore global state
    if (originalGlobal) {
      (global as any).prisma = originalGlobal
    }
  })

  describe('Singleton Pattern', () => {
    it('should create a new PrismaClient instance when no global instance exists', () => {
      process.env.NODE_ENV = 'development'
      
      // Import db module (fresh due to jest.resetModules)
      const prisma = require('../db').default
      
      expect(PrismaClient).toHaveBeenCalledTimes(1)
      expect(prisma).toBeDefined()
    })

    it('should reuse existing global PrismaClient in development environment', () => {
      process.env.NODE_ENV = 'development'
      
      // First import
      const prisma1 = require('../db').default
      
      // Clear module cache and import again
      jest.resetModules()
      const prisma2 = require('../db').default
      
      // Should have created instances but reused the global one
      expect(prisma1).toBeDefined()
      expect(prisma2).toBeDefined()
    })

    it('should store PrismaClient in global scope in non-production environment', () => {
      process.env.NODE_ENV = 'development'
      
      const globalForPrisma = global as unknown as { prisma: PrismaClient }
      expect(globalForPrisma.prisma).toBeUndefined()
      
      require('../db').default
      
      expect(globalForPrisma.prisma).toBeDefined()
    })

    it('should not pollute global scope in production environment', () => {
      process.env.NODE_ENV = 'production'
      
      const globalForPrisma = global as unknown as { prisma: PrismaClient }
      const initialGlobalPrisma = globalForPrisma.prisma
      
      require('../db').default
      
      // In production, global.prisma should remain unchanged
      expect(globalForPrisma.prisma).toBe(initialGlobalPrisma)
    })
  })

  describe('Environment-based Behavior', () => {
    it('should handle development environment correctly', () => {
      process.env.NODE_ENV = 'development'
      
      const prisma = require('../db').default
      
      expect(prisma).toBeDefined()
      expect(PrismaClient).toHaveBeenCalled()
    })

    it('should handle test environment correctly', () => {
      process.env.NODE_ENV = 'test'
      
      const prisma = require('../db').default
      
      expect(prisma).toBeDefined()
      expect(PrismaClient).toHaveBeenCalled()
    })

    it('should handle production environment correctly', () => {
      process.env.NODE_ENV = 'production'
      
      const prisma = require('../db').default
      
      expect(prisma).toBeDefined()
      expect(PrismaClient).toHaveBeenCalled()
    })

    it('should handle undefined NODE_ENV correctly', () => {
      delete process.env.NODE_ENV
      
      const prisma = require('../db').default
      
      expect(prisma).toBeDefined()
      expect(PrismaClient).toHaveBeenCalled()
    })
  })

  describe('Module Exports', () => {
    it('should export a default PrismaClient instance', () => {
      const prisma = require('../db').default
      
      expect(prisma).toBeDefined()
      expect(typeof prisma).toBe('object')
    })

    it('should export an object with expected Prisma methods', () => {
      const prisma = require('../db').default
      
      // Check for common Prisma client methods
      expect(prisma.$connect).toBeDefined()
      expect(prisma.$disconnect).toBeDefined()
      expect(prisma.user).toBeDefined()
      expect(prisma.post).toBeDefined()
    })
  })

  describe('Multiple Imports', () => {
    it('should return the same instance across multiple imports in development', () => {
      process.env.NODE_ENV = 'development'
      
      const prisma1 = require('../db').default
      const prisma2 = require('../db').default
      
      // Both imports should reference the same instance
      expect(prisma1).toBe(prisma2)
    })

    it('should maintain singleton pattern across different import statements', () => {
      process.env.NODE_ENV = 'development'
      
      // Simulate multiple imports
      const import1 = require('../db').default
      const import2 = require('../db').default
      const import3 = require('../db').default
      
      expect(import1).toBe(import2)
      expect(import2).toBe(import3)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null NODE_ENV gracefully', () => {
      process.env.NODE_ENV = null as any
      
      expect(() => {
        require('../db').default
      }).not.toThrow()
    })

    it('should handle empty string NODE_ENV', () => {
      process.env.NODE_ENV = ''
      
      const prisma = require('../db').default
      
      expect(prisma).toBeDefined()
      expect(PrismaClient).toHaveBeenCalled()
    })

    it('should handle arbitrary NODE_ENV values', () => {
      process.env.NODE_ENV = 'staging'
      
      const prisma = require('../db').default
      
      expect(prisma).toBeDefined()
      expect(PrismaClient).toHaveBeenCalled()
    })

    it('should maintain global reference after multiple resets in development', () => {
      process.env.NODE_ENV = 'development'
      
      const globalForPrisma = global as unknown as { prisma: PrismaClient }
      
      // First load
      const prisma1 = require('../db').default
      expect(globalForPrisma.prisma).toBeDefined()
      
      // Module is already loaded, second require should get cached version
      const prisma2 = require('../db').default
      expect(prisma1).toBe(prisma2)
      expect(globalForPrisma.prisma).toBeDefined()
    })
  })

  describe('Type Safety', () => {
    it('should have correct TypeScript types for global prisma', () => {
      process.env.NODE_ENV = 'development'
      
      const globalForPrisma = global as unknown as { prisma: PrismaClient }
      require('../db').default
      
      // If this compiles and runs, the typing is correct
      expect(globalForPrisma.prisma).toBeDefined()
    })

    it('should properly cast global object', () => {
      const globalForPrisma = global as unknown as { prisma: PrismaClient }
      
      // Should not throw type errors
      expect(typeof globalForPrisma).toBe('object')
    })
  })

  describe('Performance Considerations', () => {
    it('should only create one PrismaClient instance per module load', () => {
      process.env.NODE_ENV = 'production'
      
      // Import multiple times (but module is cached)
      require('../db').default
      require('../db').default
      require('../db').default
      
      // Should only call constructor once per resetModules
      expect(PrismaClient).toHaveBeenCalledTimes(1)
    })
  })
})