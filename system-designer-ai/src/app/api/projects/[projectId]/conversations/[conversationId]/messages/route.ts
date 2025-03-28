import { NextRequest, NextResponse } from 'next/server';
import {
  validateUser,
  validateProjectAccess,
  getPaginationParams,
  ApiError,
} from '@/lib/api-utils';
import {
  CreateMessageRequest,
  CreateMessageResponse,
  ListMessagesResponse,
} from '@/types/api';
import { createClient } from '@/lib/supabase/server';
import { langChainClient } from '@/lib/langchain/client';
import { buildConversationContext, formatCompleteContext } from '@/lib/langchain/context';

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string; conversationId: string }> }
) {
  try {
    const supabase = await createClient();
    const { projectId, conversationId } = await context.params;

    // Get URL parameters for pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get messages for conversation
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch messages:', error);
      return NextResponse.json(
        { error: { message: 'Failed to fetch messages' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error in get messages:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ projectId: string; conversationId: string }> }
) {
  try {
    const supabase = await createClient();
    const { projectId, conversationId } = await context.params;
    const messageData = await request.json() as CreateMessageRequest;

    // Only allow user messages to be posted directly
    if (messageData.role !== 'user') {
      return NextResponse.json(
        { error: { message: 'Only user messages can be posted directly' } },
        { status: 400 }
      );
    }

    // Validate conversation exists and belongs to project
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('project_id', projectId)
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: { message: 'Conversation not found' } },
        { status: 404 }
      );
    }

    // Create new message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          role: messageData.role,
          content: messageData.content,
          created_at: new Date().toISOString(),
          metadata: messageData.metadata,
        },
      ])
      .select()
      .single();

    if (messageError) {
      console.error('Failed to create message:', messageError);
      return NextResponse.json(
        { error: { message: 'Failed to create message' } },
        { status: 500 }
      );
    }

    // Update conversation's updated_at timestamp
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Failed to update conversation timestamp:', updateError);
    }

    // Create a placeholder AI message that will be updated via SSE
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          role: 'assistant',
          content: '', // Empty content that will be updated via SSE
          created_at: new Date().toISOString(),
          metadata: {
            status: 'generating',
            model: 'gpt-4-turbo-preview',
          },
        },
      ])
      .select()
      .single();

    if (aiMessageError) {
      console.error('Failed to create AI message placeholder:', aiMessageError);
    }

    // Generate AI response using LangChain with context
    try {
      // Build conversation context
      const conversationContext = await buildConversationContext(
        projectId,
        conversationId
      );
      
      // Format the context for the AI
      const formattedContext = formatCompleteContext(conversationContext);

      const response = await langChainClient.processMessage(
        messageData.content,
        formattedContext
      );

      // Update the AI message with the response
      const { error: updateAiError } = await supabase
        .from('messages')
        .update({
          content: response.text,
          metadata: {
            status: 'completed',
            model: 'gpt-4-turbo-preview',
            usage: response.usage,
          },
        })
        .eq('id', aiMessage?.id);

      if (updateAiError) {
        console.error('Failed to update AI message:', updateAiError);
      }
    } catch (aiError) {
      console.error('Error generating AI response:', aiError);
      // Update the AI message with error status
      const { error: updateAiError } = await supabase
        .from('messages')
        .update({
          content: 'Sorry, I encountered an error while generating the response. Please try again.',
          metadata: {
            status: 'error',
            error: aiError instanceof Error ? aiError.message : 'Unknown error occurred',
          },
        })
        .eq('id', aiMessage?.id);

      if (updateAiError) {
        console.error('Failed to update AI message with error:', updateAiError);
      }
    }

    return NextResponse.json({ 
      message,
      aiMessageId: aiMessage?.id
    });
  } catch (error) {
    console.error('Error in create message:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
} 