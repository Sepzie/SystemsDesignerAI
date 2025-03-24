/**
 * Service interfaces for external services
 * These ensure both mock and real implementations follow the same contract
 */

// Supabase service interface
export interface SupabaseService {
  auth: {
    signUp: (credentials: { email: string; password: string }) => Promise<any>;
    signIn: (credentials: { email: string; password: string }) => Promise<any>;
    signOut: () => Promise<void>;
    getSession: () => Promise<any>;
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
}

// OpenAI service interface
export interface OpenAIService {
  chat: {
    createCompletion: (params: {
      messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }>;
      temperature?: number;
      maxTokens?: number;
    }) => Promise<{
      id: string;
      choices: Array<{
        message: {
          role: string;
          content: string;
        };
        finishReason: string;
      }>;
    }>;
  };
  
  embeddings: {
    create: (params: { input: string | string[] }) => Promise<{
      data: Array<{
        embedding: number[];
        index: number;
      }>;
    }>;
  };
}

// LangChain service interface
export interface LangChainService {
  agents: {
    createSystemDesignAgent: (params: {
      projectId: string;
      userMessages: string[];
    }) => Promise<any>;
    
    runAgent: (agentId: string, input: string) => Promise<{
      output: string;
      steps: Array<{
        type: string;
        content: string;
      }>;
    }>;
  };
  
  tools: {
    generateDiagram: (description: string) => Promise<string>;
    extractRequirements: (userInput: string) => Promise<string[]>;
    recommendTechnologies: (requirements: string[]) => Promise<{
      frontend: string[];
      backend: string[];
      database: string[];
    }>;
  };
} 