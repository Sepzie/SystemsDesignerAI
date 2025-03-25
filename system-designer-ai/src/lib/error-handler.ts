import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

type HandlerFunction = (req: Request) => Promise<Response>;

export function withErrorHandler(handler: HandlerFunction): HandlerFunction {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof ApiError) {
        return new Response(
          JSON.stringify({
            error: error.message,
            statusCode: error.statusCode,
          }),
          {
            status: error.statusCode,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Handle unexpected errors
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          statusCode: 500,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };
} 