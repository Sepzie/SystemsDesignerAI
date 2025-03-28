import {
  CreateConversationResponse,
  GetConversationResponse,
  ListMessagesResponse,
  CreateMessageRequest,
  CreateMessageResponse,
} from '@/types/api';

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

  return handleResponse<ListMessagesResponse>(response);
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