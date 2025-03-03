// lib/graphql/products.ts
import { graphQLRequest, PaginatedResponse, ImageData, StockStatus } from './client';

// Types
export interface Product {
  name: string;
  slug: string;
  shortDescription: string;
  image: {
    sourceUrl: string;
  } | null;
  price: string;
  uri?: string;
}

export interface FeaturedProduct {
  name: string;
  slug: string;
  image: ImageData | null;
  regularPriceRaw: string;
  salePriceRaw: string | null;
  stockStatus: StockStatus;
  uri?: string;
}

export interface ProductsResponse {
  products: PaginatedResponse<Product>;
}

export interface FeaturedProductsResponse {
  products: PaginatedResponse<FeaturedProduct>;
}

// Queries
export const GET_FEATURED_PRODUCTS = `
  query GetFeaturedProductsSimplified {
    products(where: {featured: true}, first: 10) {
      nodes {
        name
        slug
        image {
          sourceUrl
          altText
        }
        ... on SimpleProduct {
          regularPriceRaw: regularPrice(format: RAW)
          salePriceRaw: salePrice(format: RAW)
          stockStatus
        }
        ... on VariableProduct {
          regularPriceRaw: regularPrice(format: RAW)
          salePriceRaw: salePrice(format: RAW)
          stockStatus
        }
        ... on ExternalProduct {
          regularPriceRaw: regularPrice(format: RAW)
          salePriceRaw: salePrice(format: RAW)
        }
        ... on UniformResourceIdentifiable {
          uri
        }
      }
    }
  }
`;

// Services
export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  try {
    const data = await graphQLRequest<FeaturedProductsResponse>(GET_FEATURED_PRODUCTS);
    return data.products.nodes;
  } catch (error) {
    console.error('[GraphQL] Error fetching featured products:', error);
    return [];
  }
}

export async function invalidateFeaturedProducts(): Promise<void> {
  console.log('[GraphQL] Featured products refresh requested');
  // Placeholder for future cache invalidation
}