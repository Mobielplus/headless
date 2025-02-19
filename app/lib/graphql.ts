// app/lib/graphql.ts
import { GraphQLClient } from 'graphql-request';

const graphqlClient = new GraphQLClient(
  process.env.WORDPRESS_GRAPHQL_URL || 'https://mobielplus.com/headless/graphql',
  {
    headers: {
      'Content-Type': 'application/json',
    },
  }
);

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
  console.log('[GraphQL] Fetching homepage categories');
  const startTime = performance.now();

  try {
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
    
    const data = await graphqlClient.request<ProductCategoriesResponse>(query);
    const duration = Math.round(performance.now() - startTime);

    console.log('[GraphQL] Categories fetched successfully:', {
      duration: `${duration}ms`,
      count: data.productCategories.nodes.length
    });

    return data.productCategories.nodes;
  } catch (error) {
    console.error('[GraphQL] Failed to fetch categories:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : String(error),
      duration: `${Math.round(performance.now() - startTime)}ms`
    });
    throw error;
  }
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  console.log(`[GraphQL] Fetching products for category: ${categorySlug}`);
  const startTime = performance.now();

  try {
    const query = `
      query GetProductsByCategory {
        products(
          where: { categoryIn: "${categorySlug}" }
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
    
    const data = await graphqlClient.request<ProductsResponse>(query);
    const duration = Math.round(performance.now() - startTime);

    console.log('[GraphQL] Products fetched successfully:', {
      duration: `${duration}ms`,
      count: data.products.nodes.length
    });

    return data.products.nodes;
  } catch (error) {
    console.error('[GraphQL] Failed to fetch products:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : String(error),
      duration: `${Math.round(performance.now() - startTime)}ms`
    });
    throw error;
  }
}