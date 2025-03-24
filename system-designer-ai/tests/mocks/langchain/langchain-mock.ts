import { LangChainService } from '@/types/services';

/**
 * Mock implementation of LangChain service
 * Provides deterministic responses for testing agent and tool functionalities
 */
export class LangChainMock implements LangChainService {
  // Mock delay to simulate processing time (ms)
  private mockDelay = 800;
  
  // Control flow for testing error conditions
  public shouldFailNextRequest = false;
  
  // In-memory storage of agents
  private agents: Record<string, {
    id: string;
    projectId: string;
    userMessages: string[];
    steps: Array<{ type: string; content: string }>;
  }> = {};
  
  // Predefined diagram templates
  private diagramTemplates: Record<string, string> = {
    'e-commerce': `sequenceDiagram
    Customer->>+Frontend: Browse products
    Frontend->>+API: Request product data
    API->>+Database: Query products
    Database-->>-API: Return product data
    API-->>-Frontend: Send product data
    Frontend-->>-Customer: Display products
    Customer->>+Frontend: Add to cart
    Frontend->>+API: Update cart
    API->>+Database: Store cart data
    Database-->>-API: Confirm storage
    API-->>-Frontend: Cart updated
    Frontend-->>-Customer: Show updated cart
    Customer->>+Frontend: Checkout
    Frontend->>+API: Process order
    API->>+Payment Gateway: Process payment
    Payment Gateway-->>-API: Payment confirmed
    API->>+Database: Store order
    Database-->>-API: Order stored
    API-->>-Frontend: Order confirmation
    Frontend-->>-Customer: Show order confirmation`,
    
    'blog': `classDiagram
    class User {
      +id: string
      +email: string
      +password: string
      +name: string
      +createPost()
      +commentOnPost()
    }
    class Post {
      +id: string
      +title: string
      +content: string
      +authorId: string
      +createdAt: date
      +publish()
      +unpublish()
    }
    class Comment {
      +id: string
      +content: string
      +authorId: string
      +postId: string
      +createdAt: date
      +edit()
      +delete()
    }
    class Category {
      +id: string
      +name: string
      +description: string
    }
    User "1" --> "*" Post: authors
    User "1" --> "*" Comment: writes
    Post "1" --> "*" Comment: has
    Post "*" --> "*" Category: belongs to`,
    
    'default': `flowchart TB
    A[Frontend] --> B[API Gateway]
    B --> C[Authentication Service]
    B --> D[Business Logic Service]
    D --> E[Database]
    B --> F[External Services]`
  };
  
  // Predefined technology recommendations
  private technologyRecommendations = {
    'e-commerce': {
      frontend: ['React', 'Next.js', 'TailwindCSS', 'Redux'],
      backend: ['Node.js', 'Express', 'Stripe API', 'Redis'],
      database: ['PostgreSQL', 'MongoDB', 'Elasticsearch']
    },
    'blog': {
      frontend: ['React', 'Gatsby', 'CSS Modules'],
      backend: ['Node.js', 'Express', 'GraphQL'],
      database: ['PostgreSQL', 'Redis']
    },
    'default': {
      frontend: ['React', 'Next.js', 'TailwindCSS'],
      backend: ['Node.js', 'Express'],
      database: ['PostgreSQL']
    }
  };
  
  // Helper to simulate async API calls
  private async delay<T>(data: T): Promise<T> {
    if (this.shouldFailNextRequest) {
      this.shouldFailNextRequest = false;
      throw new Error('Mock LangChain error');
    }
    
    return new Promise(resolve => setTimeout(() => resolve(data), this.mockDelay));
  }
  
  // Determine project type from user messages
  private determineProjectType(messages: string[]): 'e-commerce' | 'blog' | 'default' {
    const combinedMessage = messages.join(' ').toLowerCase();
    
    if (combinedMessage.includes('e-commerce') || 
        combinedMessage.includes('shop') || 
        combinedMessage.includes('product') ||
        combinedMessage.includes('cart')) {
      return 'e-commerce';
    } else if (combinedMessage.includes('blog') || 
               combinedMessage.includes('article') || 
               combinedMessage.includes('post') ||
               combinedMessage.includes('content')) {
      return 'blog';
    }
    
    return 'default';
  }
  
  // Extract keywords from text
  private extractKeywords(text: string): string[] {
    const keywords = [];
    const lowercaseText = text.toLowerCase();
    
    const possibleKeywords = [
      'user authentication', 'payment processing', 'database', 'api',
      'frontend', 'backend', 'mobile', 'responsive', 'search', 'reporting',
      'analytics', 'dashboard', 'admin', 'notifications', 'real-time'
    ];
    
    for (const keyword of possibleKeywords) {
      if (lowercaseText.includes(keyword)) {
        keywords.push(keyword);
      }
    }
    
    return keywords;
  }
  
  // Agents implementation
  agents = {
    createSystemDesignAgent: async (params: {
      projectId: string;
      userMessages: string[];
    }) => {
      const agentId = `agent-${Date.now()}`;
      const projectType = this.determineProjectType(params.userMessages);
      
      this.agents[agentId] = {
        id: agentId,
        projectId: params.projectId,
        userMessages: params.userMessages,
        steps: [
          { 
            type: 'initialization', 
            content: `Agent initialized for ${projectType} project`
          }
        ]
      };
      
      return this.delay({
        id: agentId,
        status: 'ready',
        projectType
      });
    },
    
    runAgent: async (agentId: string, input: string) => {
      if (!this.agents[agentId]) {
        throw new Error('Agent not found');
      }
      
      const agent = this.agents[agentId];
      agent.userMessages.push(input);
      
      const projectType = this.determineProjectType(agent.userMessages);
      const keywords = this.extractKeywords(input);
      
      // Add steps to the agent execution
      agent.steps.push(
        { 
          type: 'input_analysis', 
          content: `Analyzed input and identified keywords: ${keywords.join(', ')}`
        },
        {
          type: 'requirement_extraction',
          content: `Extracted system requirements based on ${projectType} project type`
        },
        {
          type: 'technology_selection',
          content: `Selected appropriate technologies for the ${projectType} system`
        }
      );
      
      let output = '';
      
      if (input.toLowerCase().includes('diagram')) {
        output = `I've created a system diagram for your ${projectType} project:\n\n`;
        output += `\`\`\`mermaid\n${this.diagramTemplates[projectType]}\n\`\`\``;
      } else if (input.toLowerCase().includes('technolog')) {
        const techs = this.technologyRecommendations[projectType];
        output = `For your ${projectType} project, I recommend:\n\n`;
        output += `**Frontend:** ${techs.frontend.join(', ')}\n`;
        output += `**Backend:** ${techs.backend.join(', ')}\n`;
        output += `**Database:** ${techs.database.join(', ')}`;
      } else {
        output = `Based on your requirements for a ${projectType} system, here's my analysis:\n\n`;
        output += `1. You'll need user authentication and management\n`;
        output += `2. A robust data model for your ${projectType} entities\n`;
        output += `3. API endpoints for all CRUD operations\n`;
        output += `4. A responsive frontend with a good user experience\n`;
        output += `5. Proper error handling and logging`;
      }
      
      return this.delay({
        output,
        steps: agent.steps
      });
    }
  };
  
  // Tools implementation
  tools = {
    generateDiagram: async (description: string) => {
      const projectType = this.determineProjectType([description]);
      return this.delay(this.diagramTemplates[projectType]);
    },
    
    extractRequirements: async (userInput: string) => {
      // Extract requirements based on user input
      const requirements = [
        'User authentication and authorization',
        'Data storage and retrieval',
        'API endpoints for core functionality'
      ];
      
      if (userInput.toLowerCase().includes('payment')) {
        requirements.push('Payment processing system');
      }
      
      if (userInput.toLowerCase().includes('search')) {
        requirements.push('Search functionality');
      }
      
      if (userInput.toLowerCase().includes('mobile') || userInput.toLowerCase().includes('responsive')) {
        requirements.push('Mobile-responsive interface');
      }
      
      if (userInput.toLowerCase().includes('notification')) {
        requirements.push('Notification system');
      }
      
      return this.delay(requirements);
    },
    
    recommendTechnologies: async (requirements: string[]) => {
      // Recommend technologies based on requirements
      const projectType = requirements.join(' ').toLowerCase().includes('payment') 
        ? 'e-commerce' 
        : requirements.join(' ').toLowerCase().includes('content') 
          ? 'blog' 
          : 'default';
          
      return this.delay(this.technologyRecommendations[projectType]);
    }
  };
} 