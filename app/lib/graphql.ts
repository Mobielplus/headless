// app/lib/graphql.ts
import { GraphQLClient } from 'graphql-request';
import { redis } from './redis.server';

const CACHE_TTL = 60 * 15; // 15 minutes in seconds

// Make sure to retrieve the GraphQL URL from environment variables
const WORDPRESS_GRAPHQL_URL = process.env.WORDPRESS_GRAPHQL_URL;

// Verify that the URL exists
if (!WORDPRESS_GRAPHQL_URL) {
  throw new Error('WORDPRESS_GRAPHQL_URL not found in environment variables. Please check your .env file.');
}

const graphqlClient = new GraphQLClient(
  WORDPRESS_GRAPHQL_URL,
  {
    headers: {
      'Content-Type': 'application/json',
    },
  }
);

// Generic cached GraphQL request function
async function cachedGraphQLRequest<T>(
  query: string, 
  cacheKey: string, 
  variables?: any, 
  ttl: number = CACHE_TTL
): Promise<T> {
  const startTime = performance.now();
  console.log(`[GraphQL] Request with cache key: ${cacheKey}`);
  
  try {
    // Try to get from cache first
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      const data = JSON.parse(cached) as T;
      const duration = Math.round(performance.now() - startTime);
      console.log(`[GraphQL] ✅ Cache HIT: ${cacheKey}`, {
        duration: `${duration}ms`,
        source: 'cache'
      });
      return data;
    }
    
    // If not in cache, fetch from GraphQL
    console.log(`[GraphQL] Cache MISS: ${cacheKey}`);
    const data = await graphqlClient.request<T>(query, variables);
    const duration = Math.round(performance.now() - startTime);
    
    // Store in cache with expiration - using the options object syntax
    await redis.set(cacheKey, JSON.stringify(data), {
      EX: ttl
    });
    
    console.log(`[GraphQL] ✅ Fetched and cached: ${cacheKey}`, {
      duration: `${duration}ms`,
      source: 'api'
    });
    
    return data;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    console.error(`[GraphQL] ❌ Error with request: ${cacheKey}`, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : String(error),
      duration: `${duration}ms`
    });
    throw error;
  }
}

export interface ProductCategory {
  name: string;
  slug: string;
  image: {
    sourceUrl: string;
    altText: string;
  } | null;
  showOnHomepage: boolean;
}

export interface Product {
  name: string;
  slug: string;
  shortDescription: string;
  image: {
    sourceUrl: string;
  } | null;
  price: string;
}

interface ProductCategoriesResponse {
  productCategories: {
    nodes: ProductCategory[];
  };
}

interface ProductsResponse {
  products: {
    nodes: Product[];
  };
}

export async function getHomepageCategories(): Promise<ProductCategory[]> {
  const query = `
    query GetHomepageCategories {
      productCategories(
        where: { showOnHomepage: true }
      ) {
        nodes {
          name
          slug
          image {
            sourceUrl
            altText
          }
          showOnHomepage
        }
      }
    }
  `;
  
  const cacheKey = 'homepage:categories';
  const data = await cachedGraphQLRequest<ProductCategoriesResponse>(query, cacheKey);
  
  return data.productCategories.nodes;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const query = `
    query GetProductsByCategory($categorySlug: [String]!) {
      products(
        where: { categoryIn: $categorySlug }
      ) {
        nodes {
          name
          slug
          shortDescription
          image {
            sourceUrl
          }
          ... on SimpleProduct {
            price
          }
          ... on VariableProduct {
            price
          }
        }
      }
    }
  `;
  
  const variables = { categorySlug: [categorySlug] }; // Pass as array
  const cacheKey = `products:category:${categorySlug}`;
  const data = await cachedGraphQLRequest<ProductsResponse>(
    query, 
    cacheKey, 
    variables
  );
  
  return data.products.nodes;
}

// Add a function to manually invalidate cache when needed
export async function invalidateCache(key: string): Promise<void> {
  await redis.del(key);
  console.log(`[Cache] Invalidated: ${key}`);
}

// Invalidate specific category products
export async function invalidateCategoryProducts(categorySlug: string): Promise<void> {
  await invalidateCache(`products:category:${categorySlug}`);
}

// Invalidate homepage categories
export async function invalidateHomepageCategories(): Promise<void> {
  await invalidateCache('homepage:categories');
}