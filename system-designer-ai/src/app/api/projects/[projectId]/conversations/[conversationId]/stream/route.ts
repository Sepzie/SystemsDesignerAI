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

    if (!messageId) {
      return NextResponse.json(
        { error: { message: 'Message ID is required' } },
        { status: 400 }
      );
    }

    // Set up SSE headers
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // For now, we'll simulate an AI response
          // In the future, this will connect to your actual AI service
          const response = `This is a simulated AI response to the message with ID: ${messageId}`;
          
          // Send the response as a single event
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: response })}\n\n`)
          );
          
          // Close the stream
          controller.close();
        } catch (error) {
          console.error('Error in stream:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
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