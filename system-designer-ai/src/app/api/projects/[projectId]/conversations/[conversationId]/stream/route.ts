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

    console.log('--- User Message ---:', message);

    // Set up SSE headers
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('\n=== Starting AI Response Generation ===');
          console.log('Message ID:', messageId);
          console.log('Conversation ID:', conversationId);
          console.log('Project ID:', projectId);

          // Update message status to generating
          await supabase
            .from('messages')
            .update({
              metadata: {
                status: 'generating',
                started_at: new Date().toISOString(),
              },
            })
            .eq('id', messageId);
            
          // First, let's find the user message that needs updating
          const { data: userMessages, error: findError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .eq('role', 'user')
            .order('created_at', { ascending: false })
            .limit(1);

          if (findError) {
            console.error('Error finding user message:', findError);
          } else {
            console.log('Found user messages:', userMessages);
            
            if (userMessages && userMessages.length > 0) {
              const userMessage = userMessages[0];
              console.log('Updating user message:', userMessage.id);
              
              // Update the specific user message
              const { error: updateError } = await supabase
                .from('messages')
                .update({
                  metadata: {
                    ...userMessage.metadata,
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                  },
                })
                .eq('id', userMessage.id);

              if (updateError) {
                console.error('Error updating user message:', updateError);
              } else {
                console.log('Successfully updated user message');
              }
            }
          }

          // Generate response using LangChain
          console.log('Generating AI response...');
          const response = await langChainClient.respondToUserMessage(
            message.content,
            'design', // Default to design type
            projectId,
            conversationId
          );

          // Send the response as a single event
          controller.enqueue(
            encoder.encode(`event: message\ndata: ${JSON.stringify({ content: response.content })}\n\n`)
          );
          
          // Update the message in the database with the complete response
          const { error: updateError } = await supabase
            .from('messages')
            .update({
              content: response.content,
              metadata: {
                status: 'completed',
                model: 'gpt-4-turbo-preview',
                tokens: response.metadata?.tokens,
                assetIds: response.metadata?.assetIds,
                completed_at: new Date().toISOString(),
              },
            })
            .eq('id', messageId);

          if (updateError) {
            console.error('Failed to update message in database:', updateError);
            throw new Error('Failed to save AI response');
          }

          console.log('AI Response:', response);
          console.log('AI response generation completed successfully');
          console.log('========================\n');
          
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
                completed_at: new Date().toISOString(),
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