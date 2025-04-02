import {
  CreateConversationResponse,
  GetConversationResponse,
  ListMessagesResponse,
  CreateMessageRequest,
  CreateMessageResponse,
  ConversationMessage,
  ProjectResponse,
  ListConversationsResponse,
} from '@/types/api';
import { Message } from '@/types/chat';
import { Project } from '@/types/project';
import { Asset, AssetVersion, MermaidValidationResult } from '@/types/asset';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(
      data.error?.message || 'An error occurred',
      response.status,
      data
    );
  }
  
  return data as T;
}

export async function createConversation(projectId: string): Promise<CreateConversationResponse> {
  const response = await fetch(`/api/projects/${projectId}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ projectId }),
  });

  return handleResponse<CreateConversationResponse>(response);
}

export async function getConversation(
  projectId: string,
  conversationId: string
): Promise<GetConversationResponse> {
  const response = await fetch(
    `/api/projects/${projectId}/conversations/${conversationId}`
  );

  return handleResponse<GetConversationResponse>(response);
}

export async function getMessages(
  projectId: string,
  conversationId: string,
  page?: number,
  limit?: number
): Promise<ListMessagesResponse> {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());

  const response = await fetch(
    `/api/projects/${projectId}/conversations/${conversationId}/messages?${params}`
  );

  const messages = await handleResponse<Message[]>(response);
  const conversationMessages: ConversationMessage[] = messages.map(msg => ({
    ...msg,
    conversationId
  }));
  return { messages: conversationMessages };
}

export async function sendMessage(
  projectId: string,
  conversationId: string,
  message: CreateMessageRequest
): Promise<CreateMessageResponse> {
  const response = await fetch(
    `/api/projects/${projectId}/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    }
  );

  return handleResponse<CreateMessageResponse>(response);
}

export function connectToMessageStream(
  projectId: string,
  conversationId: string,
  messageId: string,
  onMessage: (data: { content: string }) => void,
  onError: (error: Error) => void,
  onComplete: () => void
) {
  const params = new URLSearchParams({ messageId });
  const eventSource = new EventSource(
    `/api/projects/${projectId}/conversations/${conversationId}/stream?${params}`
  );

  eventSource.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to parse message'));
    }
  });

  eventSource.addEventListener('error', (event) => {
    onError(new Error('EventSource failed'));
    eventSource.close();
  });

  eventSource.addEventListener('complete', () => {
    onComplete();
    eventSource.close();
  });

  return () => {
    eventSource.close();
  };
}

export async function getProject(projectId: string): Promise<ProjectResponse> {
  const response = await fetch(`/api/projects/${projectId}`);
  return handleResponse<ProjectResponse>(response);
}

// Asset-related API functions
export async function createAsset(projectId: string, assetData: Omit<Asset, 'id' | 'project_id' | 'current_version' | 'metadata' | 'created_at' | 'updated_at'>): Promise<Asset> {
  const response = await fetch(`/api/projects/${projectId}/assets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assetData),
  });
  return handleResponse<Asset>(response);
}

export async function updateAsset(projectId: string, assetId: string, assetData: Partial<Asset>): Promise<Asset> {
  const response = await fetch(`/api/projects/${projectId}/assets/${assetId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assetData),
  });
  return handleResponse<Asset>(response);
}

export async function deleteAsset(projectId: string, assetId: string): Promise<void> {
  const response = await fetch(`/api/projects/${projectId}/assets/${assetId}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(response);
}

export async function getAssetVersion(projectId: string, assetId: string, versionNumber: number): Promise<AssetVersion | null> {
  const response = await fetch(`/api/projects/${projectId}/assets/${assetId}/versions/${versionNumber}`);
  if (!response.ok) {
    return null;
  }
  return handleResponse<AssetVersion>(response);
}

export async function getAssetVersions(projectId: string, assetId: string): Promise<AssetVersion[]> {
  const response = await fetch(`/api/projects/${projectId}/assets/${assetId}/versions`);
  return handleResponse<AssetVersion[]>(response);
}

export async function validateMermaidDiagram(content: string): Promise<MermaidValidationResult> {
  const response = await fetch('/api/validate/mermaid', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });
  return handleResponse<MermaidValidationResult>(response);
}

export async function getConversations(projectId: string): Promise<ListConversationsResponse> {
  const response = await fetch(`/api/projects/${projectId}/conversations`);
  return handleResponse<ListConversationsResponse>(response);
}

export async function deleteConversation(projectId: string, conversationId: string): Promise<void> {
  const response = await fetch(`/api/projects/${projectId}/conversations/${conversationId}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(response);
}

export async function updateConversationTitle(
  projectId: string,
  conversationId: string,
  title: string
): Promise<void> {
  const response = await fetch(`/api/projects/${projectId}/conversations/${conversationId}/title`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  return handleResponse<void>(response);
}

export async function getAsset(projectId: string, assetId: string): Promise<Asset | null> {
  try {
    const response = await fetch(`/api/projects/${projectId}/assets/${assetId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new ApiError(
        'Failed to fetch asset',
        response.status,
        await response.json()
      );
    }
    return handleResponse<Asset>(response);
  } catch (error) {
    console.error(`Error fetching asset ${assetId}:`, error);
    return null;
  }
} 