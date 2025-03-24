import { SupabaseService } from '@/types/services';

/**
 * Mock implementation of Supabase service
 * Implements the same interface as the real service but with in-memory data
 */
export class SupabaseMock implements SupabaseService {
  // In-memory storage
  private users: any[] = [];
  private sessions: any[] = [];
  private projects: any[] = [];
  private conversations: any[] = [];
  private diagrams: any[] = [];
  
  // Mock delay to simulate network latency (ms)
  private mockDelay = 100;
  
  // Control flow for testing error conditions
  public shouldFailNextRequest = false;
  
  constructor() {
    // Initialize with some test data
    this.users = [
      { id: 'test-user-1', email: 'test@example.com', password: 'password123' }
    ];
    
    this.projects = [
      { 
        id: 'test-project-1', 
        name: 'E-commerce Platform',
        description: 'A modern e-commerce solution with product catalog and checkout',
        userId: 'test-user-1',
        createdAt: new Date().toISOString()
      }
    ];
    
    this.conversations = [
      {
        id: 'test-convo-1',
        projectId: 'test-project-1',
        title: 'Initial Requirements',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'I need an e-commerce system with product management',
            timestamp: new Date().toISOString()
          }
        ]
      }
    ];
    
    this.diagrams = [
      {
        id: 'test-diagram-1',
        projectId: 'test-project-1',
        title: 'System Architecture',
        content: 'sequenceDiagram\nUser->>Frontend: Browse Products\nFrontend->>API: Fetch Products\nAPI->>Database: Query Products\nDatabase-->>API: Return Results\nAPI-->>Frontend: Product Data\nFrontend-->>User: Display Products',
        type: 'mermaid',
        createdAt: new Date().toISOString()
      }
    ];
  }
  
  // Helper to simulate async API calls
  private async delay<T>(data: T): Promise<T> {
    if (this.shouldFailNextRequest) {
      this.shouldFailNextRequest = false;
      throw new Error('Mock API error');
    }
    
    return new Promise(resolve => setTimeout(() => resolve(data), this.mockDelay));
  }
  
  // Auth methods
  auth = {
    signUp: async (credentials: { email: string; password: string }) => {
      const newUser = {
        id: `user-${Date.now()}`,
        email: credentials.email,
        password: credentials.password
      };
      
      this.users.push(newUser);
      
      const session = {
        user: { ...newUser, password: undefined },
        accessToken: `mock-token-${Date.now()}`
      };
      
      this.sessions.push(session);
      return this.delay({ data: { session }, error: null });
    },
    
    signIn: async (credentials: { email: string; password: string }) => {
      const user = this.users.find(u => 
        u.email === credentials.email && u.password === credentials.password
      );
      
      if (!user) {
        return this.delay({ data: { session: null }, error: { message: 'Invalid login credentials' } });
      }
      
      const session = {
        user: { ...user, password: undefined },
        accessToken: `mock-token-${Date.now()}`
      };
      
      this.sessions.push(session);
      return this.delay({ data: { session }, error: null });
    },
    
    signOut: async () => {
      this.sessions = [];
      return this.delay(void 0);
    },
    
    getSession: async () => {
      const session = this.sessions[this.sessions.length - 1] || null;
      return this.delay({ data: { session }, error: null });
    }
  };
  
  // Projects methods
  projects = {
    getAll: async () => {
      return this.delay(this.projects);
    },
    
    getById: async (id: string) => {
      const project = this.projects.find(p => p.id === id);
      return this.delay(project || null);
    },
    
    create: async (projectData: any) => {
      const newProject = {
        id: `project-${Date.now()}`,
        ...projectData,
        createdAt: new Date().toISOString()
      };
      
      this.projects.push(newProject);
      return this.delay(newProject);
    },
    
    update: async (id: string, projectData: any) => {
      const index = this.projects.findIndex(p => p.id === id);
      
      if (index === -1) {
        throw new Error('Project not found');
      }
      
      const updatedProject = {
        ...this.projects[index],
        ...projectData,
        updatedAt: new Date().toISOString()
      };
      
      this.projects[index] = updatedProject;
      return this.delay(updatedProject);
    },
    
    delete: async (id: string) => {
      const index = this.projects.findIndex(p => p.id === id);
      
      if (index !== -1) {
        this.projects.splice(index, 1);
      }
      
      return this.delay(void 0);
    }
  };
  
  // Conversations methods
  conversations = {
    getByProjectId: async (projectId: string) => {
      const projectConversations = this.conversations.filter(c => c.projectId === projectId);
      return this.delay(projectConversations);
    },
    
    create: async (conversationData: any) => {
      const newConversation = {
        id: `conversation-${Date.now()}`,
        ...conversationData,
        messages: conversationData.messages || [],
        createdAt: new Date().toISOString()
      };
      
      this.conversations.push(newConversation);
      return this.delay(newConversation);
    },
    
    addMessage: async (conversationId: string, messageData: any) => {
      const index = this.conversations.findIndex(c => c.id === conversationId);
      
      if (index === -1) {
        throw new Error('Conversation not found');
      }
      
      const newMessage = {
        id: `msg-${Date.now()}`,
        ...messageData,
        timestamp: new Date().toISOString()
      };
      
      this.conversations[index].messages.push(newMessage);
      return this.delay(newMessage);
    }
  };
  
  // Diagrams methods
  diagrams = {
    getByProjectId: async (projectId: string) => {
      const projectDiagrams = this.diagrams.filter(d => d.projectId === projectId);
      return this.delay(projectDiagrams);
    },
    
    create: async (diagramData: any) => {
      const newDiagram = {
        id: `diagram-${Date.now()}`,
        ...diagramData,
        createdAt: new Date().toISOString()
      };
      
      this.diagrams.push(newDiagram);
      return this.delay(newDiagram);
    },
    
    update: async (id: string, diagramData: any) => {
      const index = this.diagrams.findIndex(d => d.id === id);
      
      if (index === -1) {
        throw new Error('Diagram not found');
      }
      
      const updatedDiagram = {
        ...this.diagrams[index],
        ...diagramData,
        updatedAt: new Date().toISOString()
      };
      
      this.diagrams[index] = updatedDiagram;
      return this.delay(updatedDiagram);
    }
  };
} 