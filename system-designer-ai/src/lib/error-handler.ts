import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
    public stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        status: error.statusCode,
      },
      { status: error.statusCode }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: 'Internal Server Error',
      status: 500,
    },
    { status: 500 }
  );
}

export function withErrorHandler(handler: Function) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (error) {
      return handleApiError(error);
    }
  };
} 