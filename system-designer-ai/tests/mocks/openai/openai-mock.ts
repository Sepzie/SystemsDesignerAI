import { OpenAIService } from '@/types/services';

/**
 * Mock implementation of OpenAI service
 * Provides deterministic responses for testing
 */
export class OpenAIMock implements OpenAIService {
  // Mock delay to simulate API latency (ms)
  private mockDelay = 500;
  
  // Control flow for testing error conditions
  public shouldFailNextRequest = false;
  
  // Pre-defined responses for common queries
  private responses: Record<string, string> = {
    'system_design': `To design this e-commerce system, we'll need:

1. Frontend components:
   - Product catalog
   - Shopping cart
   - Checkout process
   - User account management

2. Backend services:
   - Authentication service
   - Product service
   - Order service
   - Payment processing

3. Database design:
   - Users table
   - Products table
   - Orders table
   - Order_Items table

4. Infrastructure:
   - Web servers
   - Database servers
   - Load balancers
   - CDN for static assets`,
    
    'database_schema': `Here's a proposed schema:

- Users (id, email, password_hash, name, created_at)
- Products (id, name, description, price, inventory_count, image_url)
- Categories (id, name, description)
- Product_Categories (product_id, category_id)
- Orders (id, user_id, status, total, created_at)
- Order_Items (id, order_id, product_id, quantity, price)`,
    
    'api_endpoints': `Recommended API endpoints:

- Authentication:
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/logout
  
- Products:
  - GET /api/products
  - GET /api/products/:id
  - GET /api/categories/:id/products
  
- Cart:
  - GET /api/cart
  - POST /api/cart/items
  - DELETE /api/cart/items/:id
  
- Orders:
  - GET /api/orders
  - POST /api/orders
  - GET /api/orders/:id`
  };
  
  // Helper to simulate async API calls
  private async delay<T>(data: T): Promise<T> {
    if (this.shouldFailNextRequest) {
      this.shouldFailNextRequest = false;
      throw new Error('Mock OpenAI API error');
    }
    
    return new Promise(resolve => setTimeout(() => resolve(data), this.mockDelay));
  }
  
  // Generates a simple deterministic embedding
  private generateEmbedding(text: string): number[] {
    const embedding: number[] = [];
    const seed = text.length;
    
    // Generate a 1536-dimension embedding (OpenAI's typical size)
    for (let i = 0; i < 1536; i++) {
      // Simple deterministic value based on character codes
      let value = 0;
      for (let j = 0; j < Math.min(text.length, 10); j++) {
        value += text.charCodeAt(j % text.length) / 1000;
      }
      value = (value * Math.sin(i * 0.1 + seed)) / 10;
      embedding.push(parseFloat(value.toFixed(6)));
    }
    
    return embedding;
  }
  
  // Find the most relevant predefined response
  private findRelevantResponse(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('database') || lowerText.includes('schema')) {
      return this.responses.database_schema;
    } else if (lowerText.includes('api') || lowerText.includes('endpoint')) {
      return this.responses.api_endpoints;
    } else {
      return this.responses.system_design;
    }
  }
  
  // Chat completion API
  chat = {
    createCompletion: async (params: {
      messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }>;
      temperature?: number;
      maxTokens?: number;
    }) => {
      // Find the last user message
      const lastUserMessage = [...params.messages].reverse()
        .find(msg => msg.role === 'user')?.content || '';
      
      // Generate a response based on the user message
      const responseContent = this.findRelevantResponse(lastUserMessage);
      
      return this.delay({
        id: `chatcmpl-${Date.now()}`,
        choices: [
          {
            message: {
              role: 'assistant',
              content: responseContent
            },
            finishReason: 'stop'
          }
        ]
      });
    }
  };
  
  // Embeddings API
  embeddings = {
    create: async (params: { input: string | string[] }) => {
      const inputs = Array.isArray(params.input) ? params.input : [params.input];
      
      const embeddings = inputs.map((text, index) => ({
        embedding: this.generateEmbedding(text),
        index
      }));
      
      return this.delay({
        data: embeddings
      });
    }
  };
} 