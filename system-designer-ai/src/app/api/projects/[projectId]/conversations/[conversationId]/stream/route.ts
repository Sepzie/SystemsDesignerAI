import { NextRequest, NextResponse } from 'next/server';
import {
  validateUser,
  validateProjectAccess,
  ApiError,
} from '@/lib/api-utils';
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
    
    // Get messageId from query parameters
    const url = new URL(request.url);
    const messageId = url.searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: { message: 'Message ID is required' } },
        { status: 400 }
      );
    }

    // Validate message exists and belongs to conversation
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .eq('conversation_id', conversationId)
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { error: { message: 'Message not found' } },
        { status: 404 }
      );
    }

    // Set up SSE headers
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Update message status to generating
          await supabase
            .from('messages')
            .update({
              metadata: {
                status: 'generating',
                model: 'gpt-4-turbo-preview',
              },
            })
            .eq('id', messageId);

          // Build conversation context
          const conversationContext = await buildConversationContext(
            projectId,
            conversationId
          );
          
          // Format the context for the AI
          const formattedContext = formatCompleteContext(conversationContext);

          // Generate response using LangChain
          const response = await langChainClient.processMessage(
            message.content,
            formattedContext
          );

          // Send the response as a single event
          controller.enqueue(
            encoder.encode(`event: message\ndata: ${JSON.stringify({ content: response.text })}\n\n`)
          );
          
          // Update the message in the database with the complete response
          const { error: updateError } = await supabase
            .from('messages')
            .update({
              content: response.text,
              metadata: {
                status: 'completed',
                model: 'gpt-4-turbo-preview',
                usage: response.usage,
              },
            })
            .eq('id', messageId);

          if (updateError) {
            console.error('Failed to update message in database:', updateError);
            throw new Error('Failed to save AI response');
          }
          
          // Send a complete event
          controller.enqueue(
            encoder.encode(`event: complete\ndata: {}\n\n`)
          );
          
          // Close the stream
          controller.close();
        } catch (error) {
          console.error('Error in stream:', error);
          
          // Update message with error status
          await supabase
            .from('messages')
            .update({
              content: 'Sorry, I encountered an error while generating the response. Please try again.',
              metadata: {
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error occurred',
              },
            })
            .eq('id', messageId);

          // Send an error event
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`)
          );
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error in stream endpoint:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
} 