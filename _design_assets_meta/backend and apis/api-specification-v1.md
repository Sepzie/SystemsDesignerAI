# API Specification for AI System Designer

## Authentication API Routes

### `POST /api/auth/login`
- **Description**: Authenticate a user and return a session token
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: 
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "string",
      "name": "string"
    },
    "token": "string"
  }
  ```

### `POST /api/auth/logout`
- **Description**: End the current user session
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `204 No Content`

### `POST /api/auth/register`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "name": "string"
  }
  ```
- **Response**: Same as login

## Project API Routes

### `GET /api/projects`
- **Description**: Get all projects for the current user
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "projects": [
      {
        "id": "uuid",
        "name": "string",
        "description": "string",
        "created_at": "timestamp",
        "updated_at": "timestamp",
        "progress": "number",
        "asset_count": "number"
      }
    ]
  }
  ```

### `POST /api/projects`
- **Description**: Create a new project with initial requirements
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "requirements": {
      "functionality": ["string"],
      "scale": "string",
      "tech_preferences": {
        "frontend": "string",
        "backend": "string",
        "database": "string"
      }
    }
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "created_at": "timestamp",
    "initial_assets": [
      {
        "id": "uuid",
        "name": "string",
        "asset_type": "string",
        "latest_version": {
          "id": "uuid",
          "version_number": "number",
          "content": "string"
        }
      }
    ]
  }
  ```

### `GET /api/projects/:id`
- **Description**: Get a specific project with its latest assets
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "requirements": "object",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "progress": "number",
    "assets": [
      {
        "id": "uuid",
        "name": "string",
        "asset_type": "string",
        "latest_version": {
          "id": "uuid",
          "version_number": "number",
          "created_at": "timestamp"
        }
      }
    ]
  }
  ```

### `PUT /api/projects/:id`
- **Description**: Update project details
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string",
    "requirements": "object"
  }
  ```
- **Response**: Updated project object

### `DELETE /api/projects/:id`
- **Description**: Delete a project and all its assets
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `204 No Content`

## Design Assets API Routes

### `GET /api/projects/:id/assets`
- **Description**: Get all assets for a project
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "assets": [
      {
        "id": "uuid",
        "name": "string",
        "asset_type": "string",
        "created_at": "timestamp",
        "updated_at": "timestamp",
        "latest_version": {
          "id": "uuid",
          "version_number": "number"
        }
      }
    ]
  }
  ```

### `GET /api/projects/:id/assets/:assetId`
- **Description**: Get a specific asset with its latest version content
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "asset_type": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "versions": [
      {
        "id": "uuid",
        "version_number": "number",
        "content": "string",
        "created_at": "timestamp",
        "created_by": "string"
      }
    ],
    "latest_version": {
      "id": "uuid",
      "version_number": "number",
      "content": "string",
      "created_at": "timestamp",
      "created_by": "string"
    }
  }
  ```

### `POST /api/projects/:id/assets`
- **Description**: Create a new asset for a project
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "name": "string",
    "asset_type": "string",
    "content": "string"
  }
  ```
- **Response**: Created asset object

### `POST /api/projects/:id/assets/:assetId/versions`
- **Description**: Create a new version of an existing asset
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "content": "string",
    "created_by": "string" // "user" or "ai"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "asset_id": "uuid",
    "version_number": "number",
    "content": "string",
    "created_at": "timestamp",
    "created_by": "string"
  }
  ```

### `PUT /api/projects/:id/assets/:assetId`
- **Description**: Update asset metadata (not content)
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "name": "string"
  }
  ```
- **Response**: Updated asset object

### `DELETE /api/projects/:id/assets/:assetId`
- **Description**: Delete an asset and all its versions
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `204 No Content`

## Conversation API Routes

### `GET /api/projects/:id/conversations`
- **Description**: Get all conversations for a project
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "conversations": [
      {
        "id": "uuid",
        "started_at": "timestamp",
        "updated_at": "timestamp",
        "message_count": "number"
      }
    ]
  }
  ```

### `POST /api/projects/:id/conversations`
- **Description**: Create a new conversation for a project
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "id": "uuid",
    "started_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```

### `GET /api/conversations/:id/messages`
- **Description**: Get all messages for a conversation
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `limit`: Maximum number of messages to return
  - `before`: Return messages before this timestamp
- **Response**:
  ```json
  {
    "messages": [
      {
        "id": "uuid",
        "role": "string", // "user" or "assistant"
        "content": "string",
        "created_at": "timestamp",
        "metadata": {
          "referenced_assets": ["uuid"]
        }
      }
    ]
  }
  ```

### `POST /api/conversations/:id/messages`
- **Description**: Create a new message in a conversation
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "content": "string",
    "role": "string", // "user" or "assistant"
    "metadata": "object" // Optional
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "role": "string",
    "content": "string",
    "created_at": "timestamp",
    "metadata": "object"
  }
  ```

## AI Stream API Routes

### `POST /api/ai/stream`
- **Description**: Stream AI responses for real-time feedback
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "conversation_id": "uuid",
    "message": "string",
    "project_id": "uuid"
  }
  ```
- **Response**: Server-Sent Events stream with the following event types:
  - `token`: Individual response token
  - `asset_update`: Notification of asset updates
  - `error`: Error message
  - `done`: Stream completion notification

## Export API Routes

### `POST /api/projects/:id/export`
- **Description**: Export project assets in various formats
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "asset_ids": ["uuid"],
    "format": "string", // "pdf", "html", "markdown"
    "destination": "string" // "download", "email", "jira", "github"
  }
  ```
- **Response**:
  ```json
  {
    "export_id": "uuid",
    "download_url": "string", // If destination is "download"
    "status": "string"
  }
  ```

### `POST /api/projects/:id/prompts`
- **Description**: Generate implementation prompts for coding agents
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "name": "string",
    "prompt_type": "string", // "code", "implementation", "testing"
    "asset_ids": ["uuid"] // Optional assets to include
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "content": "string",
    "prompt_type": "string",
    "created_at": "timestamp"
  }
  ```
