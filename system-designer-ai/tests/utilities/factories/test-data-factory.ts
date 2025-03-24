/**
 * Test data factory for generating test entities
 * Used for creating consistent test data across all tests
 */

import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  user_id: string;
  expires_at: string;
}

// User factory
export function createUser(overrides: Partial<User> = {}): User {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    email: `test-${uuidv4()}@example.com`,
    name: 'Test User',
    created_at: now,
    updated_at: now,
    ...overrides
  };
}

// Project factory
export function createProject(overrides: Partial<Project> = {}): Project {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: `Test Project ${uuidv4().slice(0, 8)}`,
    description: 'Test Project Description',
    user_id: createUser().id,
    created_at: now,
    updated_at: now,
    ...overrides
  };
}

// Conversation factory
export const createConversation = (overrides: Partial<any> = {}) => ({
  id: `conversation-${Date.now()}`,
  projectId: overrides.projectId || `project-${Date.now()}`,
  title: 'Test Conversation',
  messages: overrides.messages || [],
  createdAt: new Date().toISOString(),
  ...overrides
});

// Message factory
export const createMessage = (overrides: Partial<any> = {}) => ({
  id: `message-${Date.now()}`,
  conversationId: overrides.conversationId || `conversation-${Date.now()}`,
  role: overrides.role || 'user',
  content: overrides.content || 'This is a test message',
  timestamp: new Date().toISOString(),
  ...overrides
});

// Diagram factory
export const createDiagram = (overrides: Partial<any> = {}) => ({
  id: `diagram-${Date.now()}`,
  projectId: overrides.projectId || `project-${Date.now()}`,
  title: 'Test Diagram',
  content: overrides.content || 'graph TD\nA[Client] --> B[Server]\nB --> C[Database]',
  type: overrides.type || 'mermaid',
  createdAt: new Date().toISOString(),
  ...overrides
});

// Test projects with different types
export const createTestProjects = (userId: string) => [
  createProject({
    id: 'e-commerce-project',
    name: 'E-commerce Platform',
    description: 'An online shopping platform with product management and checkout',
    userId
  }),
  createProject({
    id: 'blog-project',
    name: 'Blog System',
    description: 'A content management system for bloggers',
    userId
  }),
  createProject({
    id: 'analytics-project',
    name: 'Analytics Dashboard',
    description: 'A data visualization dashboard for business metrics',
    userId
  })
];

// Generate bulk test data
export function generateBulkTestData(userId: string, count: number = 5): Project[] {
  return Array.from({ length: count }, () => createProject({ user_id: userId }));
}

export function createSession(overrides: Partial<Session> = {}): Session {
  const now = new Date();
  return {
    access_token: `test-access-token-${uuidv4()}`,
    refresh_token: `test-refresh-token-${uuidv4()}`,
    user_id: createUser().id,
    expires_at: new Date(now.getTime() + 3600000).toISOString(), // 1 hour from now
    ...overrides
  };
}

export function createErrorResponse(message: string, code: string = 'TEST_ERROR'): any {
  return {
    error: {
      message,
      code,
      details: null
    }
  };
}

export function createSuccessResponse(data: any): any {
  return {
    success: true,
    data
  };
} 