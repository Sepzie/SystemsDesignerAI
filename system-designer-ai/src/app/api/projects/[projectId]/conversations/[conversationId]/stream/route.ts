import { NextRequest, NextResponse } from 'next/server';
import {
  validateUser,
  validateProjectAccess,
  ApiError,
} from '@/lib/api-utils';
import { createClient } from '@/lib/supabase/server';

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
    console.log('Stream endpoint received request:', { projectId, conversationId, messageId });

    if (!messageId) {
      console.log('No messageId provided');
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
      console.log('Message not found:', { messageError, message });
      return NextResponse.json(
        { error: { message: 'Message not found' } },
        { status: 404 }
      );
    }

    console.log('Message validated, starting stream');

    // Set up SSE headers
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // For now, we'll simulate an AI response
          // In the future, this will connect to your actual AI service
          const response = `This is a simulated AI response to the message with ID: ${messageId}`;
          
          console.log('Sending message event');
          // Send the response as a single event
          controller.enqueue(
            encoder.encode(`event: message\ndata: ${JSON.stringify({ content: response })}\n\n`)
          );
          
          console.log('Sending complete event');
          // Send a complete event
          controller.enqueue(
            encoder.encode(`event: complete\ndata: {}\n\n`)
          );
          
          console.log('Closing stream');
          // Close the stream
          controller.close();
        } catch (error) {
          console.error('Error in stream:', error);
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