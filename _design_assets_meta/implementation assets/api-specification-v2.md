# AI System Designer API Specification

## Base URL
```
https://api.aisystemdesigner.com/v1
```

## Authentication
All endpoints require authentication through Bearer token except for authentication endpoints.
```
Authorization: Bearer {token}
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | User login with email and password |
| `POST` | `/auth/register` | User registration |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects` | List all projects for the authenticated user |
| `POST` | `/projects` | Create a new project with requirements |
| `GET` | `/projects/{id}` | Get project details by ID |
| `PUT` | `/projects/{id}` | Update project details |
| `DELETE` | `/projects/{id}` | Delete a project |

### Design Assets
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects/{id}/assets` | List all design assets for a project |
| `GET` | `/projects/{id}/assets/{asset_id}` | Get a specific design asset |
| `DELETE` | `/projects/{id}/assets/{asset_id}` | Delete a design asset |
| `GET` | `/projects/{id}/assets/types/{type}` | Get all assets of a specific type |

### Conversations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects/{id}/conversations` | List all conversations for a project |
| `POST` | `/projects/{id}/conversations` | Create a new conversation |
| `GET` | `/projects/{id}/conversations/{conversation_id}` | Get a specific conversation |
| `GET` | `/projects/{id}/conversations/{conversation_id}/messages` | List all messages in a conversation |
| `POST` | `/projects/{id}/conversations/{conversation_id}/messages` | Add a message to a conversation and receive AI response (may include generated assets) |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/projects/{id}/export` | Export project assets |
| `GET` | `/projects/{id}/exports` | List previous exports |
| `GET` | `/projects/{id}/exports/{export_id}` | Get a specific export |
| `POST` | `/projects/{id}/prompts` | Generate implementation prompts |
| `GET` | `/projects/{id}/prompts` | List all generated prompts |
| `GET` | `/projects/{id}/prompts/{prompt_id}` | Get a specific implementation prompt |



## Request/Response Examples

### Create Project

#### Request
```http
POST /projects
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Customer Loyalty Platform",
  "description": "A platform for managing customer loyalty programs, including points tracking, rewards, and personalized offers based on purchase history.",
  "requirements": {
    "functional": [
      "User account management",
      "Points tracking and redemption",
      "Integration with POS systems",
      "Personalized offers",
      "Analytics dashboard",
      "Mobile app access"
    ],
    "non_functional": [
      "High availability",
      "Scalability for millions of users",
      "Real-time updates",
      "Secure data handling"
    ]
  },
  "tech_preferences": {
    "frontend": "React",
    "backend": "Node.js",
    "database": "PostgreSQL",
    "deployment": "AWS"
  }
}
```

#### Response
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Customer Loyalty Platform",
  "description": "A platform for managing customer loyalty programs...",
  "created_at": "2025-03-23T14:30:45Z",
  "updated_at": "2025-03-23T14:30:45Z",
  "progress": 0,
  "initial_assets": [
    {
      "id": "7b8ec8c0-9f3e-11eb-a8b4-0242ac130003",
      "name": "System Context Diagram",
      "asset_type": "system_context",
      "created_at": "2025-03-23T14:31:15Z"
    }
  ]
}
```

### Add Message to Conversation

#### Request
```http
POST /projects/550e8400-e29b-41d4-a716-446655440000/conversations/a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d/messages
Content-Type: application/json
Authorization: Bearer {token}

{
  "role": "user",
  "content": "I need to add a recommendation engine to the platform."
}
```

#### Response
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f",
  "conversation_id": "a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d",
  "role": "user",
  "content": "I need to add a recommendation engine to the platform.",
  "created_at": "2025-03-23T15:45:30Z"
}
```

### AI Response with Generated Asset

#### Request
```http
POST /projects/550e8400-e29b-41d4-a716-446655440000/conversations/a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d/messages
Content-Type: application/json
Authorization: Bearer {token}

{
  "role": "user",
  "content": "I need to add a recommendation engine to the platform."
}
```

#### Response
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "e3f4a5b6-c7d8-9e0f-1a2b-3c4d5e6f7a8b",
  "conversation_id": "a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d",
  "role": "assistant",
  "content": "I'll help you integrate a recommendation engine. This will require a new microservice component and data collection for user browsing patterns.",
  "created_at": "2025-03-23T15:47:12Z",
  "metadata": {
    "generated_assets": [
      {
        "asset_id": "d2e3f4a5-b6c7-8d9e-0f1a-2b3c4d5e6f7a",
        "asset_type": "component",
        "name": "Recommendation Engine Component Diagram"
      }
    ]
  }
}
```

### Export Project Assets

#### Request
```http
POST /projects/550e8400-e29b-41d4-a716-446655440000/export
Content-Type: application/json
Authorization: Bearer {token}

{
  "asset_ids": [
    "7b8ec8c0-9f3e-11eb-a8b4-0242ac130003",
    "d2e3f4a5-b6c7-8d9e-0f1a-2b3c4d5e6f7a"
  ],
  "format": "pdf",
  "destination": "download"
}
```

#### Response
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "export_id": "f4a5b6c7-d8e9-0f1a-2b3c-4d5e6f7a8b9c",
  "download_url": "https://storage.aisystemdesigner.com/exports/customer-loyalty-platform-2025-03-23.pdf",
  "expires_at": "2025-03-24T15:50:45Z"
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request format or parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Request validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |

## Streaming Endpoints

The following endpoint supports server-sent events (SSE) for streaming responses:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/projects/{id}/conversations/{conversation_id}/messages/stream` | Stream AI assistant responses |

### Example Streaming Request
```http
POST /projects/550e8400-e29b-41d4-a716-446655440000/conversations/a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d/messages/stream
Content-Type: application/json
Authorization: Bearer {token}

{
  "role": "user",
  "content": "Can you explain the recommendation engine architecture in more detail?"
}
```

The response will be a stream of server-sent events containing message chunks, with a final event that includes metadata about any generated assets.

Example Stream Response:
```
event: message
data: {"type":"content","content":"The recommendation engine architecture consists of "}

event: message
data: {"type":"content","content":"several interconnected components. First, there's the "}

... (more content chunks) ...

event: message
data: {"type":"content","content":"data collection pipeline that tracks user interactions."}

event: complete
data: {"id":"e3f4a5b6-c7d8-9e0f-1a2b-3c4d5e6f7a8b","metadata":{"generated_assets":[{"asset_id":"f5g6h7i8-j9k0-1l2m-3n4o-5p6q7r8s9t0u","asset_type":"component","name":"Detailed Recommendation Engine Architecture"}]}}
```