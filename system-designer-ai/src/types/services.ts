/**
 * Service interfaces for the AI System Designer
 * These interfaces define the contracts between the application and external services
 */

// Supabase Service Interface
export interface SupabaseService {
  auth: {
    signUp: (credentials: { email: string; password: string }) => Promise<any>;
    signIn: (credentials: { email: string; password: string }) => Promise<any>;
    signOut: () => Promise<any>;
    getSession: () => Promise<any>;
    createSession?: (data: any) => Promise<any>;
  };
  
  projects: {
    getAll: () => Promise<any[]>;
    getById: (id: string) => Promise<any>;
    create: (projectData: any) => Promise<any>;
    update: (id: string, projectData: any) => Promise<any>;
    delete: (id: string) => Promise<void>;
  };
  
  conversations: {
    getByProjectId: (projectId: string) => Promise<any[]>;
    create: (conversationData: any) => Promise<any>;
    addMessage: (conversationId: string, messageData: any) => Promise<any>;
  };
  
  diagrams: {
    getByProjectId: (projectId: string) => Promise<any[]>;
    create: (diagramData: any) => Promise<any>;
    update: (id: string, diagramData: any) => Promise<any>;
  };

  from?: (table: string) => any;
}

// OpenAI Service Interface
export interface OpenAIService {
  chat: {
    completions: {
      create: (params: any) => Promise<any>;
    };
  };
  embeddings: {
    create: (params: any) => Promise<any>;
  };
}

// LangChain Service Interface
export interface LangChainService {
  generateSystemDiagram: (requirements: string) => Promise<string>;
  analyzeRequirements: (requirements: string) => Promise<any>;
  generateComponentSuggestions: (context: any) => Promise<any[]>;
} 