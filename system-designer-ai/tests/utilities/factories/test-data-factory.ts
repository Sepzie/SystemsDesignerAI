/**
 * Test data factory for generating test entities
 * Used for creating consistent test data across all tests
 */

// User factory
export const createUser = (overrides: Partial<any> = {}) => ({
  id: `user-${Date.now()}`,
  email: `test-${Date.now()}@example.com`,
  name: 'Test User',
  createdAt: new Date().toISOString(),
  ...overrides
});

// Project factory
export const createProject = (overrides: Partial<any> = {}) => ({
  id: `project-${Date.now()}`,
  name: 'Test Project',
  description: 'A test project for automated testing',
  userId: overrides.userId || `user-${Date.now()}`,
  createdAt: new Date().toISOString(),
  ...overrides
});

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
export const generateBulkTestData = (userId: string) => {
  const projects = createTestProjects(userId);
  
  const conversations = projects.map(project => 
    createConversation({
      projectId: project.id,
      title: `Initial ${project.name} Requirements`
    })
  );
  
  const messages = conversations.flatMap(conversation => [
    createMessage({
      conversationId: conversation.id,
      role: 'user',
      content: `I want to build a ${conversation.title.replace('Initial ', '').replace(' Requirements', '')}`
    }),
    createMessage({
      conversationId: conversation.id,
      role: 'assistant',
      content: `I'll help you build a ${conversation.title.replace('Initial ', '').replace(' Requirements', '')}. What specific features do you need?`
    })
  ]);
  
  const diagrams = projects.map(project => 
    createDiagram({
      projectId: project.id,
      title: `${project.name} Architecture`
    })
  );
  
  return {
    projects,
    conversations,
    messages,
    diagrams
  };
}; 