// ------------ client.ts ------------
import { GraphQLClient } from 'graphql-request';

const WORDPRESS_GRAPHQL_URL = process.env.WORDPRESS_GRAPHQL_URL;

if (!WORDPRESS_GRAPHQL_URL) {
  throw new Error('WORDPRESS_GRAPHQL_URL not found in environment variables');
}

export const graphqlClient = new GraphQLClient(
  WORDPRESS_GRAPHQL_URL,
  {
    headers: {
      'Content-Type': 'application/json',
    },
  }
);

// Common types that need to be shared across files
export interface PaginatedResponse<T> {
  nodes: T[];
  pageInfo?: {
    hasNextPage: boolean;
    endCursor: string;
  };
}

export interface ImageData {
  sourceUrl: string;
  altText?: string;
}

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ON_BACKORDER = 'ON_BACKORDER'
}

export interface RequestOptions {
  logLevel?: 'none' | 'error' | 'all';
}

const DEFAULT_OPTIONS: RequestOptions = {
  logLevel: 'error',
};

// Custom error class with query context
export class GraphQLError extends Error {
  query: string;
  variables?: Record<string, any>;
  originalError: unknown;

  constructor(
    message: string, 
    options: { 
      query: string; 
      variables?: Record<string, any>; 
      originalError: unknown 
    }
  ) {
    super(message);
    this.name = 'GraphQLError';
    this.query = options.query;
    this.variables = options.variables;
    this.originalError = options.originalError;
  }
}

export async function graphQLRequest<T>(
  query: string, 
  variables?: Record<string, any>,
  options?: RequestOptions
): Promise<T> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const startTime = performance.now();
  
  if (mergedOptions.logLevel === 'all') {
    console.log(`[GraphQL] Request initiated`);
  }
  
  try {
    // Fetch from GraphQL
    const data = await graphqlClient.request<T>(query, variables);
    const duration = Math.round(performance.now() - startTime);
    
    if (mergedOptions.logLevel === 'all') {
      console.log(`[GraphQL] ✅ Request completed`, {
        duration: `${duration}ms`,
        source: 'api'
      });
    }
    
    return data;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    
    if (mergedOptions.logLevel !== 'none') {
      console.error(`[GraphQL] ❌ Error with request`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : String(error),
        duration: `${duration}ms`
      });
    }
    
    throw new GraphQLError(
      error instanceof Error ? error.message : String(error),
      { query, variables, originalError: error }
    );
  }
}