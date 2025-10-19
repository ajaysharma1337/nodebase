# Test Suite Documentation

## Overview
This test suite provides comprehensive coverage for the Prisma integration added to the Next.js application.

## Test Files

### 1. `src/lib/__tests__/db.test.ts`
Tests for the Prisma client singleton pattern implementation:
- Singleton pattern correctness
- Environment-based behavior (development vs production)
- Global state management
- Module exports and imports
- Edge cases and error handling

### 2. `src/app/__tests__/page.test.tsx`
Tests for the home page component:
- Basic rendering
- Data fetching from Prisma
- Error handling
- Edge cases (special characters, large datasets)
- JSON serialization
- Accessibility
- Performance considerations

### 3. `prisma/__tests__/schema.test.ts`
Validation tests for the Prisma schema:
- Schema structure and configuration
- Model definitions (User and Post)
- Field types and constraints
- Relationships between models
- Best practices compliance
- Database configuration security

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- src/lib/__tests__/db.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="Singleton"
```

## Test Coverage Goals
- Line coverage: >80%
- Branch coverage: >75%
- Function coverage: >90%

## Mocking Strategy
- Prisma Client is mocked to avoid database dependencies in unit tests
- Next.js routing is mocked via jest.setup.js
- UI components are mocked for focused testing

## Best Practices
- Each test is independent and can run in isolation
- Tests clean up after themselves
- Descriptive test names follow "should [expected behavior]" pattern
- Edge cases and error conditions are thoroughly covered