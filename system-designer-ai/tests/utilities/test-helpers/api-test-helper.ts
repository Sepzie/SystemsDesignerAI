import express, { Request, Response, NextFunction, Router } from 'express';

// Type definition for route handler (return type relaxed to allow Express responses)
type RouteHandler = (req: Request, res: Response, next?: NextFunction) => any;

// Type definition for route configuration
interface RouteConfig {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  handler: RouteHandler;
}

/**
 * Creates an Express app with the specified routes for testing
 * 
 * @param routes Array of route configurations
 * @param basePrefix Optional base prefix for all routes (e.g. '/api')
 * @returns Express application configured for testing
 */
export function createTestApp(routes: RouteConfig[], basePrefix: string = '/api'): express.Application {
  const app = express();
  app.use(express.json());
  
  const router = express.Router();
  
  // Add all routes to the router
  routes.forEach(route => {
    router[route.method](route.path, route.handler);
  });
  
  // Mount the router with the base prefix
  app.use(basePrefix, router);
  
  return app;
}

/**
 * Helper function to create route configuration object
 */
export function defineRoute(
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  path: string,
  handler: RouteHandler
): RouteConfig {
  return { method, path, handler };
} 