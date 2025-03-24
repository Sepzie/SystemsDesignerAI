import { SupabaseService } from '@/types/services';

/**
 * Mock implementation of Supabase service
 * Implements the same interface as the real service but with in-memory data
 */
export class SupabaseMock implements SupabaseService {
  // In-memory storage
  private _users: any[] = [];
  private _sessions: any[] = [];
  private _projects: any[] = [];
  private _conversations: any[] = [];
  private _diagrams: any[] = [];
  
  // Mock delay to simulate network latency (ms)
  private mockDelay = 100;
  
  // Control flow for testing error conditions
  public shouldFailNextRequest = false;
  
  constructor() {
    // Initialize with some test data
    this._users = [
      { id: 'test-user-1', email: 'test@example.com', password: 'password123' }
    ];
    
    this._projects = [
      { 
        id: 'test-project-1', 
        name: 'E-commerce Platform',
        description: 'A modern e-commerce solution with product catalog and checkout',
        user_id: 'test-user-1',
        created_at: new Date().toISOString()
      }
    ];
    
    this._conversations = [
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
    
    this._diagrams = [
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
  
  // Supabase query builder interface
  from(table: string) {
    const builder = {
      data: null as any,
      error: null as any,
      
      select: (columns = '*') => {
        return builder;
      },
      
      insert: (data: any) => {
        try {
          if (table === 'projects') {
            // Handle foreign key constraints
            if (data.user_id && !this._users.find(u => u.id === data.user_id)) {
              builder.error = { 
                message: 'Foreign key violation',
                code: '23503'
              };
            } else {
              const newItem = {
                id: `${table}-${Date.now()}`,
                ...data,
                created_at: new Date().toISOString()
              };
              this._projects.push(newItem);
              builder.data = newItem;
            }
          }
        } catch (err) {
          builder.error = { message: (err as Error).message };
        }
        return builder;
      },
      
      update: (data: any) => {
        return builder;
      },
      
      delete: () => {
        return builder;
      },
      
      eq: (column: string, value: any) => {
        if (table === 'projects') {
          const index = this._projects.findIndex(p => p[column] === value);
          if (index !== -1) {
            if (builder.data === null) { // If we're in a delete operation
              this._projects.splice(index, 1);
            } else {
              builder.data = this._projects[index];
            }
          }
        }
        return builder;
      },
      
      single: () => {
        return { data: builder.data, error: builder.error };
      }
    };
    
    return builder;
  }
  
  // Auth methods
  auth = {
    signUp: async (credentials: { email: string; password: string }) => {
      const newUser = {
        id: `user-${Date.now()}`,
        email: credentials.email,
        password: credentials.password
      };
      
      this._users.push(newUser);
      
      const session = {
        user: { ...newUser, password: undefined },
        accessToken: `mock-token-${Date.now()}`
      };
      
      this._sessions.push(session);
      return this.delay({ data: { session }, error: null });
    },
    
    signIn: async (credentials: { email: string; password: string }) => {
      const user = this._users.find(u => 
        u.email === credentials.email && u.password === credentials.password
      );
      
      if (!user) {
        return this.delay({ data: { session: null }, error: { message: 'Invalid login credentials' } });
      }
      
      const session = {
        user: { ...user, password: undefined },
        accessToken: `mock-token-${Date.now()}`
      };
      
      this._sessions.push(session);
      return this.delay({ data: { session }, error: null });
    },
    
    signOut: async () => {
      this._sessions = [];
      return this.delay(void 0);
    },
    
    getSession: async () => {
      const session = this._sessions[this._sessions.length - 1] || null;
      return this.delay({ data: { session }, error: null });
    },

    createSession: async (data: any) => {
      const session = {
        ...data,
        access_token: `mock-token-${Date.now()}`,
        refresh_token: `mock-refresh-${Date.now()}`
      };
      this._sessions.push(session);
      return this.delay(session);
    }
  };
  
  // Projects methods
  projects = {
    getAll: async () => {
      return this.delay(this._projects);
    },
    
    getById: async (id: string) => {
      const project = this._projects.find(p => p.id === id);
      return this.delay(project || null);
    },
    
    create: async (projectData: any) => {
      // Check for foreign key constraints
      if (projectData.user_id && !this._users.find(u => u.id === projectData.user_id)) {
        throw new Error("foreign key violation: user_id does not exist in users table");
      }
      
      const newProject = {
        id: `project-${Date.now()}`,
        ...projectData,
        created_at: projectData.created_at || new Date().toISOString(),
        updated_at: projectData.updated_at || new Date().toISOString()
      };
      
      this._projects.push(newProject);
      return this.delay(newProject);
    },
    
    update: async (id: string, projectData: any) => {
      const index = this._projects.findIndex(p => p.id === id);
      
      if (index === -1) {
        throw new Error('Project not found');
      }
      
      const updatedProject = {
        ...this._projects[index],
        ...projectData,
        updated_at: new Date().toISOString()
      };
      
      this._projects[index] = updatedProject;
      return this.delay(updatedProject);
    },
    
    delete: async (id: string) => {
      const index = this._projects.findIndex(p => p.id === id);
      
      if (index !== -1) {
        this._projects.splice(index, 1);
      }
      
      return this.delay(void 0);
    }
  };
  
  // Conversations methods
  conversations = {
    getByProjectId: async (projectId: string) => {
      const projectConversations = this._conversations.filter(c => c.projectId === projectId);
      return this.delay(projectConversations);
    },
    
    create: async (conversationData: any) => {
      const newConversation = {
        id: `conversation-${Date.now()}`,
        ...conversationData,
        messages: conversationData.messages || [],
        createdAt: new Date().toISOString()
      };
      
      this._conversations.push(newConversation);
      return this.delay(newConversation);
    },
    
    addMessage: async (conversationId: string, messageData: any) => {
      const index = this._conversations.findIndex(c => c.id === conversationId);
      
      if (index === -1) {
        throw new Error('Conversation not found');
      }
      
      const newMessage = {
        id: `msg-${Date.now()}`,
        ...messageData,
        timestamp: new Date().toISOString()
      };
      
      this._conversations[index].messages.push(newMessage);
      return this.delay(newMessage);
    }
  };
  
  // Diagrams methods
  diagrams = {
    getByProjectId: async (projectId: string) => {
      const projectDiagrams = this._diagrams.filter(d => d.projectId === projectId);
      return this.delay(projectDiagrams);
    },
    
    create: async (diagramData: any) => {
      const newDiagram = {
        id: `diagram-${Date.now()}`,
        ...diagramData,
        createdAt: new Date().toISOString()
      };
      
      this._diagrams.push(newDiagram);
      return this.delay(newDiagram);
    },
    
    update: async (id: string, diagramData: any) => {
      const index = this._diagrams.findIndex(d => d.id === id);
      
      if (index === -1) {
        throw new Error('Diagram not found');
      }
      
      const updatedDiagram = {
        ...this._diagrams[index],
        ...diagramData,
        updatedAt: new Date().toISOString()
      };
      
      this._diagrams[index] = updatedDiagram;
      return this.delay(updatedDiagram);
    }
  };
} 