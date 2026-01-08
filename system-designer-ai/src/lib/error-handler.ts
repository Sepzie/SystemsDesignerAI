/**
 * Custom error class for API-specific errors
 * Extends the base Error class to add HTTP status code and operational status
 * 
 * @param statusCode - HTTP status code for the error (e.g., 400, 404, 500)
 * @param message - Human-readable error message
 * @param isOperational - Whether this is an operational error (true) or a programming error (false)
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Type definition for API route handlers
 * Represents a function that takes a Request and returns a Promise of Response
 */
type HandlerFunction = (req: Request) => Promise<Response>;

/**
 * Higher-order function that wraps API route handlers with consistent error handling
 * 
 * This wrapper:
 * 1. Catches any errors thrown in the route handler
 * 2. Formats error responses consistently
 * 3. Handles both operational (ApiError) and unexpected errors
 * 4. Ensures proper HTTP status codes and content types
 * 
 * @param handler - The original route handler function
 * @returns A new handler function with error handling
 */
export function withErrorHandler(handler: HandlerFunction): HandlerFunction {
  return async (req: Request) => {
    try {
      // Execute the original handler
      return await handler(req);
    } catch (error) {
      // Log the error for debugging
      console.error('API Error:', error);

      // Handle known API errors (operational errors)
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

      // Handle unexpected errors (programming errors)
      // Always return 500 Internal Server Error for unknown errors
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
