/**
 * Tests for Prisma schema validation
 * Validates schema structure, relationships, and constraints
 */

import { readFileSync } from 'fs'
import { join } from 'path'

describe('Prisma Schema (schema.prisma)', () => {
  let schemaContent: string

  beforeAll(() => {
    const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma')
    schemaContent = readFileSync(schemaPath, 'utf-8')
  })

  describe('Schema Structure', () => {
    it('should exist and be readable', () => {
      expect(schemaContent).toBeDefined()
      expect(schemaContent.length).toBeGreaterThan(0)
    })

    it('should contain generator configuration', () => {
      expect(schemaContent).toContain('generator client')
    })

    it('should specify Prisma client provider', () => {
      expect(schemaContent).toContain('provider = "prisma-client-js"')
    })

    it('should have custom output path for generated client', () => {
      expect(schemaContent).toContain('output   = "../src/generated/prisma"')
    })

    it('should contain datasource configuration', () => {
      expect(schemaContent).toContain('datasource db')
    })

    it('should use PostgreSQL as database provider', () => {
      expect(schemaContent).toContain('provider = "postgresql"')
    })

    it('should reference DATABASE_URL environment variable', () => {
      expect(schemaContent).toContain('url      = env("DATABASE_URL")')
    })
  })

  describe('User Model', () => {
    it('should define User model', () => {
      expect(schemaContent).toContain('model User')
    })

    it('should have id field as primary key', () => {
      expect(schemaContent).toMatch(/id\s+Int\s+@id/)
    })

    it('should have auto-incrementing id', () => {
      expect(schemaContent).toContain('@default(autoincrement())')
    })

    it('should have email field', () => {
      expect(schemaContent).toMatch(/email\s+String/)
    })

    it('should have unique constraint on email', () => {
      expect(schemaContent).toMatch(/email\s+String\s+@unique/)
    })

    it('should have optional name field', () => {
      expect(schemaContent).toMatch(/name\s+String\?/)
    })

    it('should have posts relation', () => {
      expect(schemaContent).toMatch(/posts\s+Post\[\]/)
    })

    it('should have all required User fields', () => {
      const userModelMatch = schemaContent.match(/model User \{[\s\S]*?\}/)?.[0]
      expect(userModelMatch).toContain('id')
      expect(userModelMatch).toContain('email')
      expect(userModelMatch).toContain('name')
      expect(userModelMatch).toContain('posts')
    })
  })

  describe('Post Model', () => {
    it('should define Post model', () => {
      expect(schemaContent).toContain('model Post')
    })

    it('should have id field as primary key', () => {
      expect(schemaContent).toMatch(/id\s+Int\s+@id/)
    })

    it('should have title field', () => {
      expect(schemaContent).toMatch(/title\s+String/)
    })

    it('should have optional content field', () => {
      expect(schemaContent).toMatch(/content\s+String\?/)
    })

    it('should have published field with default false', () => {
      expect(schemaContent).toMatch(/published\s+Boolean\s+@default\(false\)/)
    })

    it('should have authorId foreign key field', () => {
      expect(schemaContent).toMatch(/authorId\s+Int/)
    })

    it('should have author relation', () => {
      expect(schemaContent).toMatch(/author\s+User/)
    })

    it('should define proper relation to User', () => {
      expect(schemaContent).toMatch(/@relation\(fields:\s*\[authorId\],\s*references:\s*\[id\]\)/)
    })

    it('should have all required Post fields', () => {
      const postModelMatch = schemaContent.match(/model Post \{[\s\S]*?\}/)?.[0]
      expect(postModelMatch).toContain('id')
      expect(postModelMatch).toContain('title')
      expect(postModelMatch).toContain('content')
      expect(postModelMatch).toContain('published')
      expect(postModelMatch).toContain('authorId')
      expect(postModelMatch).toContain('author')
    })
  })

  describe('Model Relationships', () => {
    it('should establish one-to-many relationship between User and Post', () => {
      expect(schemaContent).toMatch(/posts\s+Post\[\]/)
      expect(schemaContent).toMatch(/author\s+User/)
    })

    it('should have proper foreign key reference', () => {
      expect(schemaContent).toMatch(/fields:\s*\[authorId\]/)
      expect(schemaContent).toMatch(/references:\s*\[id\]/)
    })

    it('should define bidirectional relationship', () => {
      // User has posts
      const userHasPosts = /model User \{[\s\S]*?posts\s+Post\[\]/.test(schemaContent)
      // Post has author
      const postHasAuthor = /model Post \{[\s\S]*?author\s+User/.test(schemaContent)
      
      expect(userHasPosts).toBe(true)
      expect(postHasAuthor).toBe(true)
    })
  })

  describe('Field Types', () => {
    it('should use Int for id fields', () => {
      const userIdMatch = schemaContent.match(/model User \{[\s\S]*?id\s+Int/)?.[0]
      const postIdMatch = schemaContent.match(/model Post \{[\s\S]*?id\s+Int/)?.[0]
      
      expect(userIdMatch).toBeTruthy()
      expect(postIdMatch).toBeTruthy()
    })

    it('should use String for text fields', () => {
      expect(schemaContent).toMatch(/email\s+String/)
      expect(schemaContent).toMatch(/title\s+String/)
    })

    it('should use Boolean for published field', () => {
      expect(schemaContent).toMatch(/published\s+Boolean/)
    })

    it('should properly mark optional fields with ?', () => {
      expect(schemaContent).toMatch(/name\s+String\?/)
      expect(schemaContent).toMatch(/content\s+String\?/)
    })
  })

  describe('Constraints and Attributes', () => {
    it('should have @id attributes on primary keys', () => {
      const idAttributes = schemaContent.match(/@id/g)
      expect(idAttributes).toHaveLength(2) // User.id and Post.id
    })

    it('should have @unique attribute on email', () => {
      expect(schemaContent).toContain('@unique')
    })

    it('should have @default attributes where appropriate', () => {
      const defaultAttributes = schemaContent.match(/@default/g)
      expect(defaultAttributes).toBeTruthy()
      expect(defaultAttributes!.length).toBeGreaterThanOrEqual(3)
    })

    it('should use autoincrement for id fields', () => {
      const autoincrementMatches = schemaContent.match(/@default\(autoincrement\(\)\)/g)
      expect(autoincrementMatches).toHaveLength(2)
    })

    it('should have @relation attribute on Post.author', () => {
      const postModelMatch = schemaContent.match(/model Post \{[\s\S]*?\}/)?.[0]
      expect(postModelMatch).toContain('@relation')
    })
  })

  describe('Schema Best Practices', () => {
    it('should follow consistent naming conventions', () => {
      // Models should be PascalCase
      expect(schemaContent).toContain('model User')
      expect(schemaContent).toContain('model Post')
    })

    it('should have proper indentation', () => {
      // Check that model contents are indented
      const userModelLines = schemaContent.match(/model User \{([\s\S]*?)\}/)?.[1]
      expect(userModelLines).toMatch(/\n\s+id/)
    })

    it('should not have syntax errors in model definitions', () => {
      // Models should have opening and closing braces
      const userModelBraces = (schemaContent.match(/model User \{[\s\S]*?\}/g) || []).length
      const postModelBraces = (schemaContent.match(/model Post \{[\s\S]*?\}/g) || []).length
      
      expect(userModelBraces).toBe(1)
      expect(postModelBraces).toBe(1)
    })

    it('should use appropriate relation names', () => {
      expect(schemaContent).toContain('posts Post[]')
      expect(schemaContent).toContain('author User')
    })
  })

  describe('Schema Comments and Documentation', () => {
    it('should contain schema documentation comments', () => {
      expect(schemaContent).toContain('//')
    })

    it('should reference Prisma documentation', () => {
      expect(schemaContent).toMatch(/pris\.ly|prisma.*docs/i)
    })
  })

  describe('Database Configuration', () => {
    it('should not hardcode database credentials', () => {
      expect(schemaContent).not.toMatch(/postgresql:\/\/.*:.*@/)
      expect(schemaContent).toContain('env("DATABASE_URL")')
    })

    it('should use environment variables for sensitive data', () => {
      expect(schemaContent).toContain('env(')
    })
  })

  describe('Generator Configuration', () => {
    it('should place generated client in src directory', () => {
      expect(schemaContent).toContain('../src/generated/prisma')
    })

    it('should use standard Prisma client generator', () => {
      expect(schemaContent).toContain('prisma-client-js')
    })
  })

  describe('Edge Cases and Validation', () => {
    it('should not have duplicate model names', () => {
      const userModelCount = (schemaContent.match(/model User \{/g) || []).length
      const postModelCount = (schemaContent.match(/model Post \{/g) || []).length
      
      expect(userModelCount).toBe(1)
      expect(postModelCount).toBe(1)
    })

    it('should not have conflicting field names within models', () => {
      const userFields = schemaContent.match(/model User \{([\s\S]*?)\}/)?.[1]
      const fieldNames = userFields?.match(/^\s*(\w+)\s+/gm)?.map(f => f.trim().split(/\s+/)[0])
      
      if (fieldNames) {
        const uniqueFields = new Set(fieldNames)
        expect(fieldNames.length).toBe(uniqueFields.size)
      }
    })

    it('should have valid relation field references', () => {
      // authorId should reference User.id
      const relationMatch = schemaContent.match(/@relation\(fields:\s*\[(.*?)\],\s*references:\s*\[(.*?)\]\)/)
      expect(relationMatch).toBeTruthy()
      expect(relationMatch?.[1]).toBe('authorId')
      expect(relationMatch?.[2]).toBe('id')
    })

    it('should not contain TODO or FIXME comments', () => {
      expect(schemaContent.toLowerCase()).not.toContain('todo')
      expect(schemaContent.toLowerCase()).not.toContain('fixme')
    })
  })

  describe('Schema Completeness', () => {
    it('should define exactly 2 models', () => {
      const modelCount = (schemaContent.match(/model \w+ \{/g) || []).length
      expect(modelCount).toBe(2)
    })

    it('should have complete model definitions', () => {
      // Each model should have at least an id field
      const userModel = schemaContent.match(/model User \{[\s\S]*?\}/)?.[0]
      const postModel = schemaContent.match(/model Post \{[\s\S]*?\}/)?.[0]
      
      expect(userModel).toContain('id')
      expect(postModel).toContain('id')
    })
  })
})